🇬🇧 **English** | 🇹🇷 [Türkçe](PRIVACY.md)

# Privacy Policy — YouTube to Sheets

**Last updated:** 2026-05-24

## Summary
YouTube to Sheets lets you save the YouTube videos you watch, along with your notes, to
**your own** Google Sheet. Your data goes directly from your browser to Google. It is
**never sent to, stored on, or shared with the developer's servers or any third party.**
There is no analytics, tracking, or advertising.

## Data processed
- **Your Google account email:** read only to display the connected account on the
  settings page. It is not stored.
- **Video info:** when you save, the current video's title, channel, channel link, URL,
  and watched/total time.
- **Content you enter:** your note and tags.

This data is written only to the Google Sheet **you select**.

## Where the data goes
- All requests go directly from your browser to Google APIs (`googleapis.com`).
- There is **no** developer-owned or third-party server. No analytics, tracking, or ads.

## Local storage
- `storage.sync`: stores only the IDs and names of your selected/created sheets.
- OAuth access token: on Chrome it is managed by the `identity` service; on Firefox a
  short-lived token is kept locally (`storage.local`) with its expiry. It is never sent to
  any server.

## Permissions (Google OAuth scopes)
- `drive.file`: access is limited to Google Sheets files **created by this extension**.
  It cannot access your other files.
- `userinfo.email`: to display the connected account.

## Data retention & deletion
- The extension stores no data on any server, so there is nothing to delete server-side.
- To disconnect: use "Disconnect" on the settings page (the token is revoked and the local
  selection cleared). To fully revoke access: https://myaccount.google.com/permissions

## Contact
zaferkahraman123@gmail.com
