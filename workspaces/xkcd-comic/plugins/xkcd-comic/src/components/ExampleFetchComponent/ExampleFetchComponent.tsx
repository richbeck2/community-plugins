/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useEffect, useState } from 'react';
import { Typography, Card, CardContent } from '@material-ui/core';

type XkcdInfo = {
  month: string;
  num: number;
  link: string;
  year: string;
  news: string;
  safe_title: string;
  transcript: string;
  alt: string;
  img: string;
  title: string;
  day: string;
};

type XkcdImage = {
  data: string;
  contentType?: string;
};

type XkcdComic = {
  info: XkcdInfo;
  image: XkcdImage;
};

export const ExampleFetchComponent = () => {
  const [comic, setComic] = useState<XkcdComic | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/xkcd-comic/comic');
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as XkcdComic;
        if (!cancelled) setComic(data);
      } catch (e: any) {
        if (!cancelled) setError(String(e.message || e));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!comic) {
    return <Typography>Loading comic…</Typography>;
  }

  const src = `data:${comic.image.contentType ?? 'image/png'};base64,${
    comic.image.data
  }`;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{comic.info.title}</Typography>
        <img
          src={src}
          alt={comic.info.safe_title || comic.info.title}
          style={{ maxWidth: '100%' }}
        />
        <Typography variant="body2">{comic.info.alt}</Typography>
      </CardContent>
    </Card>
  );
};

export default ExampleFetchComponent;
