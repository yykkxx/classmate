export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API路由处理
    if(url.pathname.startsWith('/api')) {
      return handleAPI(request, env);
    }
    
    // 静态文件托管
    return env.ASSETS.fetch(request);
  }
};

async function handleAPI(request, env) {
  const { R2_BUCKET } = env;
  const path = new URL(request.url).pathname;

  // 获取留言列表
  if(path === '/api/posts' && request.method === 'GET') {
    const list = await R2_BUCKET.list({ prefix: 'posts/' });
    return Response.json(list.objects);
  }

  // 提交新留言
  if(path === '/api/posts' && request.method === 'POST') {
    const formData = await request.formData();
    const content = formData.get('content');
    const files = formData.getAll('files');

    // 上传文件到R2
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const key = `posts/${Date.now()}-${file.name}`;
        await R2_BUCKET.put(key, file.stream());
        return { 
          name: file.name,
          url: `https://${YOUR_DOMAIN}/files/${key}` 
        };
      })
    );

    // 保存元数据
    const metaKey = `meta/${Date.now()}.json`;
    await R2_BUCKET.put(metaKey, JSON.stringify({
      content,
      files: uploadedFiles,
      timestamp: Date.now()
    }));

    return new Response('OK', { status: 201 });
  }

  return new Response('Not Found', { status: 404 });
}