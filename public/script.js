const api_url = "http://localhost:3000/api/blogs";

// load all blogs
async function loadblogs() {
  try {
    const res = await fetch(api_url);
    if (!res.ok) throw new Error("Failed to fetch blogs");
    const blogs = await res.json();

    const bloglist = document.getElementById("bloglist");
    if (!bloglist) return;

    bloglist.innerHTML = blogs
      .map(
        (b) => `
        <div>
          <h2><a href="blog.html?id=${b.id}">${b.title}</a></h2>
          <p>${b.content.substring(0, 100)}...</p>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}

// load single blog
async function loadsingleblog() {
  try {
    const param = new URLSearchParams(window.location.search);
    const id = param.get("id");

    const res = await fetch(`${api_url}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch blog");
    const blog = await res.json();

    document.getElementById("blogtitle").innerText = blog.title;
    document.getElementById("blogcontent").innerText = blog.content;

    window.blogID = id; // save globally for delete/edit
  } catch (err) {
    console.error(err);
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
    window.location.href = "home.html";
  } catch (err) {
    console.error(err);
  }
}

// delete blog
async function deleteblog() {
  try {
    await fetch(`${api_url}/${window.blogID}`, { method: "DELETE" });
    window.location.href = "home.html";
  } catch (err) {
    console.error(err);
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
