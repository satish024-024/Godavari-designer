<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9" exclude-result-prefixes="sitemap">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>Sitemap Index | Godavari Designers</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #FAF8F5;
            color: #111D42;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(17, 29, 66, 0.04);
            border: 1px solid #E6DED1;
          }
          h1 {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 38px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #111D42;
          }
          p {
            color: #6C727F;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 30px 0;
          }
          p a {
            color: #C8A15A;
            text-decoration: none;
            font-weight: 600;
          }
          p a:hover {
            text-decoration: underline;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            text-align: left;
            padding: 12px 16px;
            border-bottom: 2px solid #E6DED1;
            color: #111D42;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.1em;
          }
          td {
            padding: 14px 16px;
            border-bottom: 1px solid #FAF8F5;
            color: #2D3748;
            word-break: break-all;
          }
          tr:hover td {
            background: #FAF8F5;
          }
          .url-link {
            color: #111D42;
            text-decoration: none;
            font-weight: 500;
          }
          .url-link:hover {
            color: #C8A15A;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sitemap Index</h1>
          <p>
            This is an XML Sitemap Index generated for search engine crawlers like Google and Bing. You can return to <a href="/">Godavari Designers Homepage</a> or explore the sub-sitemaps below.
          </p>
          <table>
            <thead>
              <tr>
                <th>Sitemap URL</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                <tr>
                  <td>
                    <a class="url-link" href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
