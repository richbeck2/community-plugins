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
import {
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
} from '@backstage/backend-plugin-api';

export type XkcdInfo = {
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

export type XkcdImage = {
  data: string; // base64
  contentType?: string;
};

export type XkcdComic = {
  info: XkcdInfo;
  image: XkcdImage;
};

export class XkcdService {
  readonly #logger: LoggerService;

  static create(options: { logger: LoggerService }) {
    return new XkcdService(options.logger);
  }

  private constructor(logger: LoggerService) {
    this.#logger = logger;
  }

  async fetchLatestComic(): Promise<XkcdComic> {
    const infoUrl = 'http://xkcd.com/info.0.json';
    this.#logger.debug(`Fetching xkcd info from ${infoUrl}`);

    const infoRes = await fetch(infoUrl);
    if (!infoRes.ok) {
      throw new Error(`Failed to fetch xkcd info: ${infoRes.status}`);
    }
    const info = (await infoRes.json()) as XkcdInfo;

    const imgRes = await fetch(info.img);
    if (!imgRes.ok) {
      throw new Error(`Failed to fetch xkcd image: ${imgRes.status}`);
    }
    const contentType = imgRes.headers.get('content-type') ?? undefined;
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = buffer.toString('base64');

    return {
      info,
      image: {
        data,
        contentType,
      },
    };
  }
}

export const xkcdServiceRef = createServiceRef<{
  fetchLatestComic(): Promise<XkcdComic>;
}>({
  id: 'xkcd.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: { logger: coreServices.logger },
      async factory(deps) {
        return XkcdService.create({ logger: deps.logger });
      },
    }),
});
