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
        <div class="blog-card">
          <h3><a href="blog.html?id=${blog.id}">${blog.title}</a></h3>
          <p>${(blog.content || "").substring(0, 100)}</p>
          <a href="blog.html?id=${blog.id}">Read More</a>
        </div>
      `;
      bloglist.innerHTML += blogCard;
    });
  } catch (err) {
    console.error("Error loading blogs:", err);
  }
}


// load single blog
    async function loadsingleblog() {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (!id) {
        document.body.innerHTML = "<h2>No blog selected</h2>";
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/blogs/${id}`);
        if (!res.ok) throw new Error("Failed to fetch blog");
        const data = await res.json();

        document.getElementById("blogtitle").textContent = data.title;
        document.getElementById("blogcontent").textContent = data.content;
        window.blogID = id;
      } catch (err) {
        console.error("Error:", err);
        document.body.innerHTML = "<h2>Blog not found</h2>";
      }
    }

// create blog
async function createblog(event) {
  event.preventDefault();
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
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (confirm("Are you sure you want to delete this blog?")) {
        try {
          await fetch(`http://localhost:3000/api/blogs/${id}`, { method: "DELETE" });
          alert("Blog deleted!");
          window.location.href = "blogs.html";
        } catch (err) {
          console.error("Error deleting blog:", err);
        }
      }
    }

// edit blog
async function editblog() {
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
        const res = await fetch("http://localhost:3000/api/blogs");
        const blogs = await res.json();

        const bloglist = document.getElementById("bloglist");
        bloglist.innerHTML = blogs.map(b => `
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm border-0">
              <div class="card-body">
                <h5 class="card-title fw-bold">${b.title}</h5>
                <p class="card-text">${b.content.substring(0, 100)}...</p>
                <a href="blog.html?id=${b.id}" class="btn btn-primary">Read More</a>
              </div>
            </div>
          </div>
        `).join("");
      } catch (err) {
        console.error("Failed to load blogs", err);
      }
    }

// Following is for Footer recent post API
async function loadRecentPosts() {
  try {
    let res = await fetch("http://localhost:3000/api/blogs?limit=3"); // API se last 3 posts
    let data = await res.json();

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

// ✅ Newsletter Form Submit
document.getElementById("newsletterForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  let email = document.getElementById("emailInput").value;
  let msgBox = document.getElementById("newsletterMsg");

  try {
    let res = await fetch("http://localhost:3000/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (res.ok) {
      msgBox.textContent = "✅ Subscribed successfully!";
      msgBox.className = "text-success";
    } else {
      msgBox.textContent = "❌ Failed to subscribe!";
      msgBox.className = "text-danger";
    }
  } catch (err) {
    msgBox.textContent = "⚠ Error connecting to server!";
    msgBox.className = "text-warning";
  }
});