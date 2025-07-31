import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { fedify } from "./fedify";
import { createFederation, MemoryKvStore } from "@fedify/fedify";

import { configure, getConsoleSink } from "@logtape/logtape";

// Logging settings for diagnostics:
await configure({
	sinks: { console: getConsoleSink() },
	filters: {},
	loggers: [
		{
			category: "fedify",
			lowestLevel: "debug",
			sinks: ["console"],
			filters: [],
		},
		{
			category: ["logtape", "meta"],
			lowestLevel: "warning",
			sinks: ["console"],
			filters: [],
		},
	],
});

const federation = createFederation<void>({
	kv: new MemoryKvStore(),
});

federation.setNodeInfoDispatcher("/nodeinfo/2.1", async () => {
	return {
		software: {
			name: "your-software-name", // Lowercase, digits, and hyphens only.
			version: { major: 1, minor: 0, patch: 0 },
			homepage: new URL("https://your-software.com/"),
		},
		protocols: ["activitypub"],
		usage: {
			// Usage statistics is hard-coded here for demonstration purposes.
			// You should replace these with real statistics:
			users: { total: 100, activeHalfyear: 50, activeMonth: 20 },
			localPosts: 1000,
			localComments: 2000,
		},
	};
});

const app = new Elysia();

app
	.use(swagger())
	.use(fedify(federation, () => void 0))
	.get("/", ({ request, set }) => {
		// Set content type
		set.headers["Content-Type"] = "text/plain";

		// Get host from request headers
		const host = request.headers.get("host") || "localhost";

		return `
 _____        _ _  __         ____
|  ___|__  __| (_)/ _|_   _  |  _ \\  ___ _ __ ___   ___
| |_ / _ \\/ _\` | | |_| | | | | | | |/ _ \\ '_ \` _ \\ / _ \\
|  _|  __/ (_| | |  _| |_| | | |_| |  __/ | | | | | (_) |
|_|  \\___|\\__,_|_|_|  \\__, | |____/ \\___|_| |_| |_|\\___/
                      |___/

This small federated server app is a demo of Fedify.  The only one
thing it does is to accept follow requests.

You can follow this demo app via the below handle:

    @demo@${host}
  `;
	})
	.listen(3000);
