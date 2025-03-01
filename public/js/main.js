const API_ENDPOINT = '/api';

async function submitPost() {
  const content = document.getElementById('content').value;
  const files = document.getElementById('file-input').files;

  const formData = new FormData();
  formData.append('content', content);
  Array.from(files).forEach(file => formData.append('files', file));

  const res = await fetch(`${API_ENDPOINT}/posts`, {
    method: 'POST',
    body: formData
  });

  if(res.ok) loadPosts();
}

async function loadPosts() {
  const res = await fetch(`${API_ENDPOINT}/posts`);
  const posts = await res.json();
  
  const html = posts.map(post => `
    <div class="post">
      <div class="content">${post.content}</div>
      ${post.files.map(file => `
        <a href="${file.url}" target="_blank">${file.name}</a>
      `).join('')}
    </div>
  `).join('');
  
  document.getElementById('posts').innerHTML = html;
}

// 初始化加载
loadPosts();