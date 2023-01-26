import { wait } from "./utils";

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/InterruptReason
const continueInterruptReasons = new Set([
    "FILE_BLOCKED",
    "NETWORK_FAILED",
    "NETWORK_TIMEOUT",
    "NETWORK_DISCONNECTED",
    "NETWORK_SERVER_DOWN",
    "NETWORK_INVALID_REQUEST",
    "SERVER_FAILED",
    "SERVER_NO_RANGE",
    "SERVER_BAD_CONTENT",
    "SERVER_UNAUTHORIZED",
    "SERVER_CERT_PROBLEM",
    "SERVER_FORBIDDEN",
    "CRASH",
]);

const retryDownloads = true;

const delay = 5000;

browser.downloads.onChanged.addListener(async (delta) => {
    if (delta.state?.current !== "interrupted") {
        return;
    }

    const [download] = await browser.downloads.search({ id: delta.id });

    console.log(
        `Download ${download.id} (${download.filename}) interrupted. Reason: ${download.error}`
    );

    if (!download.error || !continueInterruptReasons.has(download.error)) {
        return;
    }

    await wait(delay);

    // allow the user to abort this
    if ((await browser.downloads.search({ id: delta.id })).length === 0) {
        return;
    }

    if (download.canResume) {
        console.log(`Resuming download ${download.id}.`);
        await browser.downloads.resume(download.id).catch(console.error);
    } else if (retryDownloads) {
        console.log(`Retrying download ${download.id}.`);
        await browser.downloads
            .download({
                url: download.url,
            })
            .then(() => browser.downloads.erase({ id: download.id }))
            .catch(console.error);
    }
});
