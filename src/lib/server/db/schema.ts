import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.schema';

const timestamps = {
	createdOn: integer({ mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedOn: integer({ mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
}

export const item = sqliteTable('item', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	sku: text('sku').notNull().unique(),
	name: text('name').notNull(),
	imageUrl: text("image_url"),
	location: text('location').notNull(),
	status: text('status', { enum: ['disponible', 'prestado', 'desconocido'] }).notNull().default('disponible'),
	observations: text('observations'),

	...timestamps
});

export const history = sqliteTable('history', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	itemId: text('item_id')
		.notNull()
		.references(() => item.id, { onDelete: "restrict" }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
	borrowedAt: integer('borrowed_at', { mode: "timestamp_ms" }),
	returnExpectedAt: integer('return_expected_at', { mode: "timestamp_ms" }),
	returnedAt: integer('return_at', { mode: "timestamp_ms" }),

	...timestamps,
})

export const request = sqliteTable("request", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	requestedAt: integer("requested_at", {
		mode: "timestamp"
	})
		.notNull()
		.$defaultFn(() => new Date()),
	description: text('description'),
	purpose: text('purpose').notNull(),
	reviewedAt: integer("reviewed_at", {
		mode: "timestamp"
	}),

	...timestamps
});

export const requestItem = sqliteTable("request_item", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	requestId: text("request_id")
		.notNull()
		.references(() => request.id, { onDelete: "cascade" }),
	itemId: text("item_id")
		.notNull()
		.references(() => item.id),
	status: text("status", {
		enum: ["pendiente", "aceptado", "rechazado"]
	})
		.notNull()
		.default("pendiente"),
	reviewedAt: integer("reviewed_at", {
		mode: "timestamp"
	}),
	reviewedBy: text("reviewed_by")
		.references(() => user.id),

	...timestamps,
})

// Relations

// Item relationships
export const itemRelations = relations(item, ({ many }) => ({
	history: many(history),
	requests: many(requestItem),
}));

// History relationships
export const historyRelations = relations(history, ({ one }) => ({
	item: one(item, {
		fields: [history.itemId],
		references: [item.id],
	}),

	user: one(user, {
		fields: [history.userId],
		references: [user.id],
	}),
}));

// Request relationships
export const requestRelations = relations(request, ({ one, many }) => ({
	user: one(user, {
		fields: [request.userId],
		references: [user.id],
	}),

	items: many(requestItem),
}));

// Request item relationships
export const requestItemRelations = relations(requestItem, ({ one }) => ({
	request: one(request, {
		fields: [requestItem.requestId],
		references: [request.id],
	}),

	item: one(item, {
		fields: [requestItem.itemId],
		references: [item.id],
	}),

	reviewer: one(user, {
		fields: [requestItem.reviewedBy],
		references: [user.id],
		relationName: 'requestItemReviewer',
	}),
}));

export * from './auth.schema';
