-- Supabase Storage 配置脚本
-- 创建媒体文件存储桶和相关策略

-- 1. 创建 media 存储桶 (需要在 Supabase Dashboard 中手动创建)
-- 存储桶名称: media
-- 公开访问: true

-- 2. 创建存储策略
-- 允许所有用户上传文件
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media');

-- 允许所有用户查看文件
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- 允许删除文件（可选，根据需求）
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'media');

-- 3. 更新 media_files 表（如果不存在则创建）
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL UNIQUE,
    file_type VARCHAR NOT NULL,
    file_size INTEGER NOT NULL,
    alt_text VARCHAR,
    mime_type VARCHAR,
    width INTEGER,
    height INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON public.media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON public.media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON public.media_files(created_at);

-- 5. 启用行级安全
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略
CREATE POLICY "Allow public read access" ON public.media_files
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to upload" ON public.media_files
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own files" ON public.media_files
FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Allow users to delete their own files" ON public.media_files
FOR DELETE USING (auth.uid() = uploaded_by);

-- 7. 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON public.media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();