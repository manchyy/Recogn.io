import styles from './App.module.css';

let videoFeedLink = "http://127.0.0.1:5000/video_feed"
function VideoFeed() {
  return(
  <img 
  src={videoFeedLink}
  style={{ width: '400px', height: '300px'}} 
  class={styles.img} 
  alt="video feed">
  </img>
  )
}

function Content() {
    return (
        <div class={styles.content}>
            <VideoFeed/>
            <p>a</p>
        </div>
    )
}

export default Content;