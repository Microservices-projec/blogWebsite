const api_url = "http://localhost:3000/api/blogs";

// load all blogs
async function loadblogs() {
  try {
    const res = await fetch(api_url);
    if (!res.ok) throw new Error("Failed to fetch blogs");
    const blogs = await res.json();

    const bloglist = document.getElementById("bloglist");
    if (!bloglist) return;

    bloglist.innerHTML = "";
    blogs.forEach(blog => {
      const blogCard = `
        <div class="card shadow-sm border-0 mb-4 blog-card">
          <div class="card-body">
            <!-- Blog Title -->
            <h4 class="card-title mb-2">
              <a href="blog.html?id=${blog.id}" class="text-dark text-decoration-none fw-bold">
                ${blog.title}
              </a>
            </h4>
        
            <!-- Blog Excerpt -->
            <p class="card-text text-muted">
              ${(blog.content || "").substring(0, 100)}...
            </p>
            <!-- Author + Date -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                ${blog.displayName ? `<small class="text-muted">✍️ By ${blog.displayName}</small>` : ''}
              </div>
              <a href="blog.html?id=${blog.id}" class="btn btn-sm btn-primary rounded-pill px-3">
                Read More →
              </a>
            </div>
          </div>
        </div>
      `;
      bloglist.innerHTML += blogCard;
    });
  } catch (err) {
    console.error("Error loading blogs:", err);
  }
}


// load single blog
// load single blog - UPDATED
async function loadsingleblog() {
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
async function createblog(event) {
  event.preventDefault();
  
  // Check if user is logged in
  try {
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();
    
    if (!userData.user) {
      alert('Please login to create a blog');
      window.location.href = '/auth/google';
      return;
    }
  } catch (error) {
    console.error('Error checking user authentication:', error);
    alert('Error checking authentication status');
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
    window.location.href = "blogs.html";
  } catch (err) {
    console.error(err);
  }
}

// delete blog
async function deleteblog() {
  // Check if user is logged in
  try {
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();
    
    if (!userData.user) {
      alert('Please login to delete a blog');
      window.location.href = '/auth/google';
      return;
    }
  } catch (error) {
    console.error('Error checking user authentication:', error);
    alert('Error checking authentication status');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (confirm("Are you sure you want to delete this blog?")) {
    try {
      await fetch(`${api_url}/${id}`, { method: "DELETE" });
      alert("Blog deleted!");
      window.location.href = "blogs.html";
    } catch (err) {
      console.error("Error deleting blog:", err);
    }
  }
}

// edit blog
async function editblog() {
  // Check if user is logged in
  try {
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();
    
    if (!userData.user) {
      alert('Please login to edit a blog');
      window.location.href = '/auth/google';
      return;
    }
  } catch (error) {
    console.error('Error checking user authentication:', error);
    alert('Error checking authentication status');
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
    location.reload();
  } catch (err) {
    console.error(err);
  }
}

// get blog page, show all blogs.
async function renderBlogs() {
  try {
    const res = await fetch(`${api_url}`);
    const blogs = await res.json();

    const bloglist = document.getElementById("bloglist");
    bloglist.innerHTML = blogs.map(b => `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <h5 class="card-title fw-bold">${b.title}</h5>
            <p class="card-text">${b.content.substring(0, 100)}...</p>
            ${b.displayName ? `<small class="text-muted d-block mb-2">By ${b.displayName}</small>` : ''}
            <a href="blog.html?id=${b.id}" class="btn btn-primary">Read More</a>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to load blogs", err);
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
    let res = await fetch(`${api_url}?limit=3`); // API se last 3 posts
    let data = await res.json();

    data = data.reverse().slice(0, 3);

    let container = document.getElementById("recentPosts");
    container.innerHTML = "";

    data.forEach(post => {
      let li = document.createElement("li");
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
loadRecentPosts();

// // Newsletter Form Submit
// document.getElementById("newsletterForm").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   let email = document.getElementById("emailInput").value;
//   let msgBox = document.getElementById("newsletterMsg");

//   try {
//     let res = await fetch("http://localhost:3000/api/newsletter", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email })
//     });

//     if (res.ok) {
//       msgBox.textContent = "Subscribed successfully!";
//       msgBox.className = "text-success";
//     } else {
//       msgBox.textContent = "Failed to subscribe!";
//       msgBox.className = "text-danger";
//     }
//   } catch (err) {
//     msgBox.textContent = "⚠ Error connecting to server!";
//     msgBox.className = "text-warning";
//   }
// });

// Additional function to check authentication status
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    
    return data.user;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return null;
  }
}