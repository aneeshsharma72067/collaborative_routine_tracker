export type ID = string | number;

export interface RequestUser {
	sub: string;
	email: string;
	[key: string]: unknown;
}
