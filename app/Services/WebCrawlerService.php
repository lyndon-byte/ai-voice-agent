<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\DomCrawler\Crawler;

class WebCrawlerService
{
    private Client $client;
    private array $visited = [];
    private array $allLinks = [];
    private string $baseOrigin;
    private int $maxPages;

    public function __construct(int $maxPages = 50)
    {
        $this->maxPages = $maxPages;
        $this->client = new Client([
            'timeout'  => 10,
            'headers'  => [
                'User-Agent' => 'Mozilla/5.0 (compatible; Crawler/1.0)',
            ],
            'verify'   => false, // disable SSL verification if needed
        ]);
    }

    public function crawl(string $startUrl): array
    {
        $parsed = parse_url($startUrl);
        $this->baseOrigin = $parsed['scheme'] . '://' . $parsed['host'];

        $queue = [$startUrl];

        while (!empty($queue) && count($this->visited) < $this->maxPages) {
            $url = array_shift($queue);

            if (in_array($url, $this->visited)) {
                continue;
            }

            $this->visited[] = $url;
            echo "Crawling (" . count($this->visited) . "/{$this->maxPages}): {$url}\n";

            $links = $this->getLinks($url);

            foreach ($links as $link) {
                $this->allLinks[] = $link;

                $linkOrigin = parse_url($link, PHP_URL_SCHEME) . '://' . parse_url($link, PHP_URL_HOST);

                if ($linkOrigin === $this->baseOrigin && !in_array($link, $this->visited)) {
                    $queue[] = $link;
                }
            }

            // Polite delay
            usleep(300000); // 300ms
        }

        // Return unique same-domain links only
        return array_unique(array_filter($this->allLinks, function ($link) {
            $origin = parse_url($link, PHP_URL_SCHEME) . '://' . parse_url($link, PHP_URL_HOST);
            return $origin === $this->baseOrigin;
        }));
    }

    private function getLinks(string $url): array
    {
        try {
            $response = $this->client->get($url);
            $html = (string) $response->getBody();

            $crawler = new Crawler($html, $url);
            $links = [];

            $crawler->filter('a[href]')->each(function (Crawler $node) use ($url, &$links) {
                $href = $node->attr('href');

                // Skip empty, anchors, mailto, tel
                if (empty($href) || str_starts_with($href, '#') 
                    || str_starts_with($href, 'mailto:') 
                    || str_starts_with($href, 'tel:')) {
                    return;
                }

                // Resolve relative URLs
                $resolved = $this->resolveUrl($href, $url);
                if ($resolved) {
                    $links[] = $resolved;
                }
            });

            return $links;

        } catch (RequestException $e) {
            echo "Skipping {$url}: " . $e->getMessage() . "\n";
            return [];
        }
    }

    private function resolveUrl(string $href, string $base): ?string
    {
        // Already absolute
        if (str_starts_with($href, 'http://') || str_starts_with($href, 'https://')) {
            return $href;
        }

        $parsed = parse_url($base);
        $scheme = $parsed['scheme'];
        $host   = $parsed['host'];
        $path   = $parsed['path'] ?? '/';

        // Protocol-relative
        if (str_starts_with($href, '//')) {
            return $scheme . ':' . $href;
        }

        // Root-relative
        if (str_starts_with($href, '/')) {
            return $scheme . '://' . $host . $href;
        }

        // Relative path
        $basePath = dirname($path) . '/';
        return $scheme . '://' . $host . $basePath . $href;
    }
}