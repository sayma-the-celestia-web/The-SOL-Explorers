/**
 * Canvas & Audio video recording service to export the 8-second visualization
 * directly as a high-fidelity 60fps MP4/WebM video file for NASA Space Apps presentation slides.
 */

import { soundManager } from './soundManager';

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public startRecording(canvas: HTMLCanvasElement): boolean {
    if (this.isRecording) return false;
    this.recordedChunks = [];

    try {
      // Capture canvas stream at 60 FPS
      const canvasStream = canvas.captureStream(60);
      const combinedStream = new MediaStream();

      // Add video tracks
      canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));

      // Attempt to capture Web Audio stream
      const audioCtx = soundManager.getAudioContext();
      const masterGain = soundManager.getMasterGain();

      if (audioCtx && masterGain) {
        try {
          const dest = audioCtx.createMediaStreamDestination();
          masterGain.connect(dest);
          dest.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
        } catch {
          // Audio track connection optional
        }
      }

      // Pick supported mime type
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime || undefined,
        videoBitsPerSecond: 8000000 // 8 Mbps high quality
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: selectedMime || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'The_Sol_Explorers_Jezero_Descent_8s.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 2000);
        this.isRecording = false;
      };

      this.mediaRecorder.start(200);
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      this.isRecording = false;
      return false;
    }
  }

  public stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (err) {
        console.error('Error stopping recorder:', err);
      }
    }
    this.isRecording = false;
  }
}

export const videoRecorder = new VideoRecorder();
