import {draftMode} from 'next/headers'

export async function GET(request: Request) {
  const draft = await draftMode()
  draft.disable()

  return new Response(null, {
    status: 307,
    headers: {Location: new URL('/', request.url).toString()},
  })
}
