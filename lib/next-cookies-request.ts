export const nextCookiesRequest = {
  id: 'next-cookies-request',
  fetchPlugins: [
    {
      id: 'next-cookies-request-plugin',
      name: 'next-cookies-request-plugin',
      hooks: {
        async onRequest(ctx: any) {
          if (typeof window === 'undefined') {
            const { cookies } = await import('next/headers');
            const headers = await cookies();
            ctx.headers.set('cookie', headers.toString());
          }
        },
      },
    },
  ],
};
