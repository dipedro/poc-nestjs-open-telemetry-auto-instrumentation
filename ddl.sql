SELECT 'CREATE DATABASE jedi' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'jedi')\gexec

\c jedi

CREATE TABLE IF NOT EXISTS public.jedi (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	teste VARCHAR(20) NOT NULL
);

DO $$
BEGIN
	INSERT INTO jedi (teste) 
	VALUES 
		('teste1'),
		('teste2'),
		('teste3'),
		('teste4'),
		('teste5')
	ON CONFLICT DO NOTHING;
END $$;