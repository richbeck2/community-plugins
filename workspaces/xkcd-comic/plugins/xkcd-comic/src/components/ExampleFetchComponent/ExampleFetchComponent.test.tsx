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
import { renderInTestApp } from '@backstage/test-utils';
import { ExampleFetchComponent } from './index';

describe('ExampleFetchComponent', () => {
  it('fetches and renders an xkcd comic', async () => {
    const fakeResponse = {
      info: {
        month: '1',
        num: 123,
        link: '',
        year: '2000',
        news: '',
        safe_title: 'Funny',
        transcript: '',
        alt: 'Alt text',
        img: 'https://example.com/img.png',
        title: 'A Test Comic',
        day: '1',
      },
      image: {
        data: 'RkFLRURfQkFTRTY0', // 'FAKED_BASE64' base64-ish
        contentType: 'image/png',
      },
    };

    // Mock fetch to return our fake response
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(fakeResponse) }),
    );

    const { findByAltText, getByText } = await renderInTestApp(
      <ExampleFetchComponent />,
    );

    // The title should be visible
    expect(getByText('A Test Comic')).toBeInTheDocument();

    // The image with the alt text should be present
    const img = await findByAltText('Funny');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
  });
});
