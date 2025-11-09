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
import { startTestBackend } from '@backstage/backend-test-utils';
import { createServiceFactory } from '@backstage/backend-plugin-api';
import { xkcdComicPlugin } from './plugin';
import request from 'supertest';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { xkcdServiceRef } from './services/XkcdService';

describe('plugin', () => {
  it('should return latest xkcd comic with base64 image', async () => {
    const fakeComic = {
      info: {
        month: '11',
        num: 3165,
        link: '',
        year: '2025',
        news: '',
        safe_title: 'Earthquake Prediction Flowchart',
        transcript: '',
        alt: "At least people who make religious predictions of the apocalypse have an answer to the question 'Why didn't you predict any of the other ones that happened recently?'",
        img: 'https://imgs.xkcd.com/comics/earthquake_prediction_flowchart.png',
        title: 'Earthquake Prediction Flowchart',
        day: '7',
      },
      image: {
        data: Buffer.from('PNGDATA').toString('base64'),
        contentType: 'image/png',
      },
    };

    const { server } = await startTestBackend({
      features: [
        xkcdComicPlugin,
        catalogServiceMock.factory({
          entities: [],
        }),
        createServiceFactory({
          service: xkcdServiceRef,
          deps: {},
          factory: () => ({
            fetchLatestComic: jest.fn().mockResolvedValue(fakeComic),
          }),
        }),
      ],
    });

    const res = await request(server).get('/api/xkcd-comic/comic').expect(200);
    expect(res.body).toEqual(fakeComic);
  });
});
