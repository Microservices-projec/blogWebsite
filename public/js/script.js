// API Configuration
const api_url = "http://localhost:3000/api/blogs";

// Authentication functions
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    
    if (data.user) {
      // User is logged in - show user info and hide login button
      document.getElementById('login-btn').style.display = 'none';
      document.getElementById('user-info').style.display = 'flex';
      document.getElementById('user-name').textContent = data.user.displayName;
      document.getElementById('user-avatar').src = data.user.avatar;
      
      // Show create blog link only to logged in users
      const createLink = document.querySelector('a[href="create.html"]');
      if (createLink) {
        createLink.style.display = 'block';
      }
    } else {
      // User is not logged in - show login button and hide user info
      document.getElementById('login-btn').style.display = 'block';
      document.getElementById('user-info').style.display = 'none';
      
      // Hide create blog link for non-logged in users
      const createLink = document.querySelector('a[href="create.html"]');
      if (createLink) {
        createLink.style.display = 'none';
      }
    }
    
    return data.user;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return null;
  }
}

// Blog loading functions
async function loadBlogs() {
  try {
    const res = await fetch(api_url);
    if (!res.ok) throw new Error("Failed to fetch blogs");
    const blogs = await res.json();

    const bloglist = document.getElementById("bloglist");
    if (!bloglist) return;

    bloglist.innerHTML = "";
    blogs.forEach(blog => {
      const blogElement = createBlogCard(blog);
      bloglist.appendChild(blogElement);
    });
  } catch (err) {
    console.error("Error loading blogs:", err);
    showToast('Failed to load blogs', 'danger');
  }
}

function createBlogCard(blog) {
  const col = document.createElement('div');
  col.className = 'col';
  
  col.innerHTML = `
    <div class="blog-card card h-100">
      <img src="${blog.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}" class="card-img-top" alt="${blog.title}">
      <div class="card-body">
        <h5 class="card-title">${blog.title}</h5>
        <p class="card-text">${(blog.content || "").substring(0, 100)}...</p>
        <div class="blog-meta">
          <div class="blog-author">
            <img src="${blog.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}" alt="${blog.author || 'Unknown Author'}" class="blog-author-img">
            <span>${blog.author || 'Unknown Author'}</span>
          </div>
          <div class="blog-date">
            <i class="bi bi-calendar3 me-1"></i>${blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Unknown date'}
          </div>
        </div>
        <div class="blog-tags">
          ${blog.tags ? blog.tags.map(tag => `<span class="blog-tag">#${tag}</span>`).join('') : ''}
        </div>
        <a href="blog.html?id=${blog.id}" class="btn btn-primary btn-read-more">Read More</a>
      </div>
    </div>
  `;
  
  return col;
}

// load single blog
async function loadSingleBlog() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.body.innerHTML = "<h2>No blog selected</h2>";
    return;
  }

  try {
    const res = await fetch(`${api_url}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch blog");
    const data = await res.json();

    document.getElementById("blogtitle").textContent = data.title;
    document.getElementById("blogcontent").textContent = data.content;
    window.blogID = id;

    // Display author information if available
    if (data.displayName) {
      const authorNameElement = document.getElementById("author-name");
      if (authorNameElement) {
        authorNameElement.textContent = `By ${data.displayName}`;
        authorNameElement.style.display = "block";
      }
    }

    if (data.avatar) {
      const authorAvatarElement = document.getElementById("author-avatar");
      if (authorAvatarElement) {
        authorAvatarElement.src = data.avatar;
        authorAvatarElement.style.display = "block";
      }
    }

    if (data.created_at) {
      const blogDateElement = document.getElementById("blog-date");
      if (blogDateElement) {
        blogDateElement.textContent = new Date(data.created_at).toLocaleDateString();
        blogDateElement.style.display = "block";
      }
    }

    // Check if current user is the blog owner and show action buttons
    if (data.user_id) {
      checkBlogOwnership(data.user_id);
    }

  } catch (err) {
    console.error("Error:", err);
    document.getElementById("blogtitle").textContent = "Blog not found";
    document.getElementById("blogcontent").textContent = "The requested blog could not be found.";
  }
}

// create blog
async function createBlog(event) {
  event.preventDefault();
  
  // Check if user is logged in
  try {
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();
    
    if (!userData.user) {
      showToast('Please login to create a blog', 'warning');
      setTimeout(() => {
        window.location.href = '/auth/google';
      }, 2000);
      return;
    }
  } catch (error) {
    console.error('Error checking user authentication:', error);
    showToast('Error checking authentication status', 'danger');
    return;
  }

  try {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    const res = await fetch(api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) throw new Error("Failed to create blog");
    
    showToast('Blog created successfully!', 'success');
    setTimeout(() => {
      window.location.href = "blogs.html";
    }, 1500);
  } catch (err) {
    console.error(err);
    showToast('Failed to create blog', 'danger');
  }
}

// delete blog
async function deleteBlog() {
  // Check if user is logged in
  try {
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();
    
    if (!userData.user) {
      showToast('Please login to delete a blog', 'warning');
      setTimeout(() => {
        window.location.href = '/auth/google';
      }, 2000);
      return;
    }
  } catch (error) {
    console.error('Error checking user authentication:', error);
    showToast('Error checking authentication status', 'danger');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (confirm("Are you sure you want to delete this blog?")) {
    try {
      await fetch(`${api_url}/${id}`, { method: "DELETE" });
      showToast('Blog deleted successfully!', 'success');
      setTimeout(() => {
        window.location.href = "blogs.html";
      }, 1500);
    } catch (err) {
      console.error("Error deleting blog:", err);
      showToast('Failed to delete blog', 'danger');
    }
  }
}

// edit blog
async function editBlog() {
  // Check if user is logged in
  try {
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();
    
    if (!userData.user) {
      showToast('Please login to edit a blog', 'warning');
      setTimeout(() => {
        window.location.href = '/auth/google';
      }, 2000);
      return;
    }
  } catch (error) {
    console.error('Error checking user authentication:', error);
    showToast('Error checking authentication status', 'danger');
    return;
  }

  try {
    const newtitle = prompt("New Title:");
    const newcontent = prompt("New Content:");

    if (!newtitle || !newcontent) return;

    const res = await fetch(`${api_url}/${window.blogID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newtitle, content: newcontent }),
    });

    if (!res.ok) throw new Error("Failed to update blog");
    
    showToast('Blog updated successfully!', 'success');
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (err) {
    console.error(err);
    showToast('Failed to update blog', 'danger');
  }
}

// Check if current user is the blog owner
async function checkBlogOwnership(blogAuthorId) {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    
    if (data.user && data.user.id === blogAuthorId) {
      const actionButtons = document.getElementById('action-buttons');
      if (actionButtons) {
        actionButtons.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error checking blog ownership:', error);
  }
}

// Following is for Footer recent post API
async function loadRecentPosts() {
  try {
    let res = await fetch(`${api_url}?limit=3`);
    let data = await res.json();

    data = data.reverse().slice(0, 3);

    let container = document.getElementById("recentPosts");
    if (!container) return;
    
    container.innerHTML = "";

    data.forEach(post => {
      let li = document.createElement("li");
      li.className = "mb-2";
      li.innerHTML = `
        <div class="d-flex mb-2">
          <img src="https://picsum.photos/50?random=${post.id}" class="me-2 rounded" width="50" height="50">
          <div>
            <small class="text-muted"><i class="bi bi-calendar"></i> ${new Date(post.created_at).toDateString()}</small><br>
            <a href="blog.html?id=${post.id}" class="text-decoration-none fw-semibold">${post.title}</a>
          </div>
        </div>`;
      container.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading posts", err);
  }
}

// Newsletter form handling
function setupNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  
  const messageEl = document.getElementById('newsletterMsg');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value.trim();
    
    if (!validateEmail(email)) {
      showNewsletterMessage('Please enter a valid email address.', 'error');
      return;
    }
    
    // Simulate API call
    showNewsletterMessage('Subscribing...', 'info');
    
    setTimeout(() => {
      showNewsletterMessage('Thank you for subscribing to our newsletter!', 'success');
      emailInput.value = '';
    }, 1500);
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showNewsletterMessage(message, type) {
  const messageEl = document.getElementById('newsletterMsg');
  if (!messageEl) return;
  
  messageEl.textContent = message;
  messageEl.className = `newsletter-message text-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
}

// View toggle functionality
function setupViewToggle() {
  const viewButtons = document.querySelectorAll('.btn-view');
  const blogList = document.getElementById('bloglist');
  
  if (!viewButtons.length || !blogList) return;
  
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      const viewType = this.getAttribute('data-view');
      
      // Update active button
      viewButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Change layout
      if (viewType === 'list') {
        blogList.classList.add('list-view');
        blogList.classList.remove('row-cols-1', 'row-cols-md-2', 'row-cols-lg-3');
        blogList.classList.add('row-cols-1');
        
        // Update cards for list view
        document.querySelectorAll('.blog-card').forEach(card => {
          card.classList.add('list-view-card');
        });
      } else {
        blogList.classList.remove('list-view');
        blogList.classList.add('row-cols-1', 'row-cols-md-2', 'row-cols-lg-3');
        blogList.classList.remove('row-cols-1');
        
        // Revert cards to grid view
        document.querySelectorAll('.blog-card').forEach(card => {
          card.classList.remove('list-view-card');
        });
      }
    });
  });
}

// Load more functionality
function setupLoadMore() {
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (!loadMoreBtn) return;
  
  loadMoreBtn.addEventListener('click', function() {
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    this.disabled = true;
    
    // Simulate loading more blogs
    setTimeout(() => {
      // In a real app, this would fetch more data from an API
      loadBlogs();
      
      this.innerHTML = '<i class="bi bi-arrow-repeat me-2"></i>Load More Blogs';
      this.disabled = false;
      
      // Show a toast notification
      showToast('New blogs loaded successfully!', 'success');
    }, 2000);
  });
}

// Toast notification function
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Initialize and show the toast
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  // Remove the toast from DOM after it's hidden
  toast.addEventListener('hidden.bs.toast', function() {
    document.body.removeChild(toast);
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  setupNewsletterForm();
  setupViewToggle();
  setupLoadMore();
  loadRecentPosts();
  
  // Determine which page we're on and load appropriate content
  const path = window.location.pathname;
  
  if (path.endsWith('blogs.html') || path.endsWith('home.html') || path === '/') {
    loadBlogs();
  } else if (path.endsWith('blog.html')) {
    loadSingleBlog();
  }
  
  // Add CSS for list view
  const style = document.createElement('style');
  style.textContent = `
    .list-view .blog-card {
      flex-direction: row;
      height: auto;
    }
    
    .list-view .blog-card .card-img-top {
      width: 300px;
      height: auto;
      border-top-right-radius: 0;
      border-bottom-left-radius: var(--bs-card-inner-border-radius);
    }
    
    @media (max-width: 768px) {
      .list-view .blog-card {
        flex-direction: column;
      }
      
      .list-view .blog-card .card-img-top {
        width: 100%;
        height: 200px;
        border-bottom-left-radius: 0;
        border-top-right-radius: var(--bs-card-inner-border-radius);
      }
    }
  `;
  document.head.appendChild(style);
});

// Event listener for create blog form
const createForm = document.getElementById('create-blog-form');
if (createForm) {
  createForm.addEventListener('submit', createBlog);
}