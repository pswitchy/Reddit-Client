import React, { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, RefreshCw, MoreVertical, X, Moon, Sun, Search, ExternalLink } from 'lucide-react';

const SubredditLane = ({ subreddit, onRefresh, onDelete, index }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [after, setAfter] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchPosts = async (refresh = false) => {
    setLoading(true);
    try {
      const url = `https://www.reddit.com/r/${subreddit}.json${after && !refresh ? `?after=${after}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch subreddit data');
      const data = await response.json();
      setPosts(prevPosts => refresh ? data.data.children.map(child => child.data) : [...prevPosts, ...data.data.children.map(child => child.data)]);
      setAfter(data.data.after);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [subreddit]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  return (
    <Draggable draggableId={subreddit} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4 transition-transform transform hover:scale-105">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">r/{subreddit}</h2>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="IconButton" aria-label="More options">
                  <MoreVertical className="dark:text-white" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="DropdownMenuContent dark:bg-gray-700 dark:text-white">
                  <DropdownMenu.Item className="DropdownMenuItem" onSelect={() => onRefresh(subreddit)}>
                    Refresh
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="DropdownMenuItem" onSelect={() => onDelete(subreddit)}>
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          {error ? (
            <p className="text-red-500 dark:text-red-400">{error}</p>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="border-b dark:border-gray-700 pb-2 cursor-pointer" onClick={() => handlePostClick(post)}>
                  <h3 className="font-semibold dark:text-white">{post.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>↑ {post.ups}</span>
                    <span className="ml-2">Posted by u/{post.author}</span>
                  </div>
                </div>
              ))}
              {!loading && after && (
                <button onClick={() => fetchPosts()} className="Button secondary dark:bg-gray-700 dark:text-white">
                  Load More
                </button>
              )}
            </div>
          )}
          {loading && <p className="dark:text-white">Loading...</p>}
          {selectedPost && (
            <Dialog.Root open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
              <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                  <Dialog.Title className="DialogTitle">{selectedPost.title}</Dialog.Title>
                  <div className="mt-4">
                    <p className="dark:text-white">{selectedPost.selftext}</p>
                    <a href={`https://www.reddit.com${selectedPost.permalink}`} target="_blank" rel="noopener noreferrer" className="Button primary mt-4">
                      View on Reddit <ExternalLink className="ml-2" />
                    </a>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </div>
      )}
    </Draggable>
  );
};

const AddSubredditModal = ({ isOpen, onClose, onAdd }) => {
  const [newSubreddit, setNewSubreddit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(newSubreddit);
    setNewSubreddit('');
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">Add Subreddit</Dialog.Title>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={newSubreddit}
              onChange={(e) => setNewSubreddit(e.target.value)}
              className="Input"
              placeholder="Enter subreddit name"
              required
            />
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={onClose} className="Button secondary mr-2">
                Cancel
              </button>
              <button type="submit" className="Button primary">
                Add
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const RedditClient = () => {
  const [subreddits, setSubreddits] = useState(['learnprogramming', 'webdev', 'javascript']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddSubreddit = (subreddit) => {
    setSubreddits([...subreddits, subreddit]);
  };

  const handleDeleteSubreddit = (subreddit) => {
    setSubreddits(subreddits.filter((s) => s !== subreddit));
  };

  const handleRefreshSubreddit = (subreddit) => {
    // Logic to refresh subreddit posts
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const filteredSubreddits = subreddits.filter(subreddit =>
    subreddit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reddit Client</h1>
        <div className="flex items-center">
          <button onClick={toggleDarkMode} className="IconButton mr-4">
            {darkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-gray-800" />}
          </button>
          <button onClick={() => setIsModalOpen(true)} className="Button primary">
            <Plus className="mr-2" /> Add Subreddit
          </button>
        </div>
      </div>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="Input w-full pl-10"
            placeholder="Search subreddits..."
          />
          <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="subreddits">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {filteredSubreddits.map((subreddit, index) => (
                <SubredditLane
                  key={subreddit}
                  subreddit={subreddit}
                  index={index}
                  onRefresh={handleRefreshSubreddit}
                  onDelete={handleDeleteSubreddit}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <AddSubredditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddSubreddit} />
    </div>
  );
};

export default RedditClient;
