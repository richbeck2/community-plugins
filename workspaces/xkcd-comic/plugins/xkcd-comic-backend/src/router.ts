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
import { HttpAuthService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { xkcdServiceRef } from './services/XkcdService';

export async function createRouter({
  xkcd,
}: {
  httpAuth: HttpAuthService;
  xkcd: typeof xkcdServiceRef.T;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // Get latest xkcd comic (info + base64 image)
  router.get('/comic', async (_req, res) => {
    const comic = await xkcd.fetchLatestComic();
    res.json(comic);
  });

  return router;
}
