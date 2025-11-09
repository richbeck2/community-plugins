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
import { mockErrorHandler, mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';

describe('createRouter (xkcd)', () => {
  let app: express.Express;

  beforeEach(async () => {
    // Mock xkcd service
    const mockXkcd = {
      fetchLatestComic: jest.fn(),
    };

    const router = await createRouter({
      httpAuth: mockServices.httpAuth(),
      xkcd: mockXkcd,
    });

    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });

  it('returns latest comic with base64 image', async () => {
    const fakeComic = {
      info: {
        month: '11',
        num: 3165,
        link: '',
        year: '2025',
        news: '',
        safe_title: 'Earthquake Prediction Flowchart',
        transcript: '',
        alt: 'Alt text',
        img: 'https://imgs.xkcd.com/comics/earthquake_prediction_flowchart.png',
        title: 'Earthquake Prediction Flowchart',
        day: '7',
      },
      image: {
        data: Buffer.from('PNGDATA').toString('base64'),
        contentType: 'image/png',
      },
    };

    // Replace router's xkcd service mock with one that returns fakeComic
    // Note: createRouter captured mockXkcd from beforeEach; to set its behavior
    // we need to reconstruct the router with a mock having behavior.
    const mockXkcd = {
      fetchLatestComic: jest.fn().mockResolvedValue(fakeComic),
    };

    const router = await createRouter({
      httpAuth: mockServices.httpAuth(),
      xkcd: mockXkcd,
    });

    const localApp = express();
    localApp.use(router);
    localApp.use(mockErrorHandler());

    const res = await request(localApp).get('/comic').expect(200);
    expect(res.body).toEqual(fakeComic);
  });

  it('returns 500 when xkcd service fails', async () => {
    const mockXkcd = {
      fetchLatestComic: jest.fn().mockRejectedValue(new Error('fail')),
    };

    const router = await createRouter({
      httpAuth: mockServices.httpAuth(),
      xkcd: mockXkcd,
    });

    const localApp = express();
    localApp.use(router);
    localApp.use(mockErrorHandler());

    await request(localApp).get('/comic').expect(500);
  });
});
