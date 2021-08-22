import Head from 'next/head'
import Image from 'next/image'
//import styles from '../styles/Home.module.css'
import { useState, setState, useEffect } from 'react'
import Speech from 'speak-tts'
import { bounce } from 'react-animations'
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  bounce: {
    animationName: bounce,
    animationDuration: '1s'
  }
})

export default function Home() {
  const url = "https://random-word-api.herokuapp.com/";
  const choices = ["all", "word"]

  const [word, setWord] = useState("");
  const [previousWord, setPreviousWord] = useState("");
  const [prediction, setPrediction] = useState("");
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(1);
  const [isRight, setIsRight] = useState(false);

  const speakWord = (wordToSpeak) => {
    const speech = new Speech(); // will throw an exception if not browser supported
    speech.init({
      'volume': 1,
      'lang': 'en-US',
      'listeners': {
        'onvoiceschanged': (voices) => {
          console.log("Event voiceschanged", voices)
        }
      }
    });
    speech.speak({
      text: wordToSpeak,
      queue: false, // current speech will be interrupted,
    }).then(() => {
      console.log("Success !")
    }).catch(e => {
      console.error("An error occurred :", e)
    });
  }
  const fetchWord = () => {
    const fullURL = url + choices[1]

    fetch(fullURL)
      .then(response => response.json())
      .then(data => data[0])
      .then(fetchedWord => {
        setWord(fetchedWord);
        speakWord(fetchedWord);
      })
  }
  const handleChange = (event) => {
    setPrediction(event.target.value);
  }
  const handleSubmit = (event) => {
    event.preventDefault();

    setTries(tries + 1);
  }
  const tryAgain = () => {
    setScore(0);
    setTries(1);
  }
  useEffect(() => {
    if (word == prediction) {
      setScore(score + 1);
      setIsRight(true);
    } else {
      setIsRight(false);
    } 
    setPreviousWord(word);

    setPrediction("");
    if (tries < 10) { 
      fetchWord();    
    }
  }, [tries]);
  return (
    <>
      <Head>
        <title>Spell Mii</title>
      </Head>
      {

        tries > 10 ? <button onClick={tryAgain}>Try again</button> : <>
          <h1>
            Spell the word
          </h1>
          <h2>
            Round {tries}
          </h2>
          <form onSubmit={handleSubmit}>
            <input type="text" value={prediction} onChange={handleChange} />
            <input type="submit" value="Submit" />
            <input type="button" value="Repeat" onClick={() => speakWord(word)} />
          </form>
          { previousWord == "" ? null : 
          <p className={isRight ? '' : css(styles.bounce)}>
            {isRight ? "Correct!" : "Wrong!"} Previous word was <b>{previousWord}</b>
          </p>
          }
        </>

      }
      <p>
        {score} / 10
      </p>
    </>
  )
}
