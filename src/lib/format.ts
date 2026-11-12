const fmt = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });

export function formatDate(value: string | Date | null | undefined) {
	return value ? fmt.format(new Date(value)) : '—';
}

export function daysLate(expected: string | null) {
	if (!expected) return 0;
	return Math.max(0, Math.floor((Date.now() - new Date(expected).getTime()) / 86_400_000));
}

export const normalize = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
