CREATE POLICY "Member photos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos');

CREATE POLICY "Users upload own member photo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'member-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own member photo"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'member-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'member-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
