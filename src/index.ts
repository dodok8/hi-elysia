import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

import { user } from "./user";
import { note } from "./note";

const app = new Elysia()
	// Apply the swagger plugin
	.use(swagger())
	.use(note)
	.use(user)
	.listen(3000);
