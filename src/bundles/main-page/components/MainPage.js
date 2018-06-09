import React from 'react';
import Button from '@material-ui/core/Button'
import RecordIcon from '@material-ui/icons/Mic';
import Recorder from 'recorderjs';

const log = (msg) => {
  const node = document.createElement("p");
  node.innerText = msg;
  document.body.appendChild(node);
};

export default class MainPage extends React.Component{
  constructor(){
    super();
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      window.URL = window.URL || window.webkitURL;
      navigator.getUserMedia(
        {audio: true, video: false},
        stream => {
          const audioContext = new AudioContext();
          const input = audioContext.createMediaStreamSource(stream);
          this.recorder = new Recorder(input);
          log('recorder initialized');
        },
        error => log(error)
      );
    } catch (e) {
      log('No web audio support in this browser!');
    }
  }

  componentWillUnmount(){
    this.recorder.clear();
  }

  /**
   * {Recorder}
   */
  recorder;

  onRecordStart = () => {
    this.recorder.record();
  };

  onRecordEnd = () => {
    this.recorder.stop();
    log('recorder stopped');
    this.recorder.exportWAV(blob => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      log('audio is playing')
    })
  };

  render(){
    return(
      <div>
        <Button
          variant="fab"
          color="primary"
          aria-label="record"
          style={{position: 'fixed', right: 16, bottom: 16}}
          onMouseDown={this.onRecordStart}
          onMouseUp={this.onRecordEnd}
        >
          <RecordIcon />
        </Button>
      </div>
    );
  }
}