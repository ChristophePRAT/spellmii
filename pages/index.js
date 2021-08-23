import Head from 'next/head'
import Image from 'next/image'
//import styles from '../styles/Home.module.css'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, { useState, setState, useEffect } from 'react'
import Speech from 'speak-tts'
import useWindowDimensions from './windowHelper.js'
import { StyleSheet, css } from 'aphrodite';
//import icon from '/thumbs_up.svg'

const ThumbsAnimation = React.memo(props => {
  const items = [...Array(props.number)];
  const { width, height } = useWindowDimensions();

  const calculatePos = (imageSize, vh) => {
    let max = 100 - 100 * imageSize / (vh ? height : width)
    var num = Math.random() * (max);
    return Math.floor(num);
  }

  const styles = (size) => {
    return(
      {
        top: calculatePos(size, true) + "vh",
        left: calculatePos(size, false) + "vw",
      }
    )
  }

  const circles = items.map(item => {
    // Size of the thumbs up image
    const size = Math.floor(Math.random() * 30) + 20;
    return (
      <div style={
        // Calculate the position of the thumbs up. (randomly generated)
        styles(size)
        } className="circle-container">
        <img width={size + "px"} height={size + "px"} src="/thumbs_up.svg" />
      </div>
    )
  });
  return (
    <>
      {
        circles
      }
    </>
  )
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
  const { height, width } = useWindowDimensions()
  const [showThumbs, setShowThumbs] = useState(false);

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

  const animate = () => {
    setShowThumbs(true);

    setInterval(() => {
      setShowThumbs(false);
    }, 3000)
    
  }

  useEffect(() => {
    if (word != "") {
      if (word == prediction) {
        setScore(score + 1);
        setIsRight(true);
      } else {
        setIsRight(false);
      }
      console.log(isRight)
      animate();
    }
    setPreviousWord(word);

    setPrediction("");
    if (tries <= 10) { 
      fetchWord();    
    }
  }, [tries]);
  return (
    <>
      <Head>
        <title>Spell Mii</title>
      </Head>
      { showThumbs ? <div className={"thumbscontainer " + (isRight ? "success" : "failure")} id="thumbs"> <ThumbsAnimation number={10} />
      </div>: null }
             

      <center>
        {

          tries > 10 ? <Button onClick={tryAgain}>Try again</Button> : <>
            <h1>
              Spell the word
            </h1>
            <h2>
              Round {tries}
            </h2>

            <Form onSubmit={handleSubmit}> 
              <Form.Control type="text" value={prediction} onChange={handleChange} disabled={showThumbs} className="mb-3 w-25" />
              <Button type="submit" className="m-3" variant="success">
                Submit
              </Button>
              <Button onClick={() => speakWord(word)} className="m-3" variant="light">
                Repeat
              </Button>
            </Form>
            { previousWord == "" ? null : 
            <p className={"text-light p-3 rounded d-inline-block " + (isRight ? "bg-success" : "bg-danger")}> 
              {isRight ? "Correct!" : "Wrong!"} Previous word was <b>{previousWord}</b>
            </p>
            }
          </>

        }
        <h2 className="monospace">
          {score} / 10
        </h2>
      </center>
      <footer>
        <a href='https://dryicons.com/free-icons/thumbs-up'> Icon by Dryicons </a>
      </footer>
    </>
  )
}


