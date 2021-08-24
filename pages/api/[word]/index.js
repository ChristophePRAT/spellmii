import * as googleTTS from 'google-tts-api';
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'
//import { useRouter } from 'next/router'
// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'POST', 'OPTIONS'],
  })
)

export default async function handler(req, res) {
  await cors(req, res);

  const { word } = req.query;
  console.log(word)
  googleTTS
    .getAudioBase64(word, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000
    })
    .then((data) => res.status(200).send(data))
    .catch((error) => res.send(error))
}
