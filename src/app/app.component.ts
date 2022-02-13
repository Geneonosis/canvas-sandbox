import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { utils } from 'protractor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  public images: string[] = [];
  public selectedImage: string = '';

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  private canvasNativeElement: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;

  ngOnInit(): void {
    this.images.push(...this.generateRandomImages());
    this.selectedImage = this.images[0];
  }

  ngAfterViewInit(): void {
    console.log(this.canvas.nativeElement);
    this.canvasLoader();
    this.reloadCanvas();
  }

  // reload the canvas
  public reloadCanvas() {
    let image: HTMLImageElement = new Image();
    image.src = this.selectedImage;
    //what to do on image load
    image.onload = () => {
      this.canvasContext.drawImage(image, 0, 0, image.width, image.height);

      this.canvasContext.strokeStyle = 'red';
      this.canvasContext.strokeRect(
        0,
        0,
        this.canvasNativeElement.width,
        this.canvasNativeElement.height
      );
      this.canvasContext.fillStyle = 'red';
      this.canvasContext.fillRect(
        this.canvasNativeElement.width / 2 - 2,
        this.canvasNativeElement.height / 2 - 2,
        4,
        4
      );
      this.canvasContext.fillStyle = 'black';
      this.canvasContext.fillRect(
        this.canvasNativeElement.width / 2 - 2,
        this.canvasNativeElement.height / 2 - 20,
        100,
        10
      );
      this.canvasContext.fillStyle = 'red';
      this.canvasContext.fillText(
        `center point`,
        this.canvasNativeElement.width / 2,
        this.canvasNativeElement.height / 2 - 10
      );
      this.canvasContext.fillText(
        `width x height: ${this.canvasNativeElement.width} x ${this.canvasNativeElement.height}`,
        10,
        10
      );
      console.log(
        this.canvasNativeElement.width,
        this.canvasNativeElement.height
      );
    };
  }

  // click on an image
  public onClickImage(image: string) {
    this.selectedImage = image;
    this.reloadCanvas();
  }

  // generate random images
  public generateRandomImages(): string[] {
    const randomImages = [];
    for (let i = 0; i < 10; i++) {
      randomImages.push(
        `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/1920/1080`
      );
    }
    return randomImages;
  }

  // resize the canvas when the window is resized
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.reloadCanvasSize();
    this.reloadCanvas();
  }

  // reload the canvas size
  public reloadCanvasSize() {
    var tempCanvas: HTMLCanvasElement = document.createElement('canvas');
    tempCanvas.width = this.canvas.nativeElement.width;
    tempCanvas.height = this.canvas.nativeElement.height;
    var tempContext: CanvasRenderingContext2D = tempCanvas.getContext('2d');
    tempContext.drawImage(this.canvasContext.canvas, 0, 0);

    this.setCanvasSize();
    this.canvasContext.drawImage(tempCanvas, 0, 0);
  }

  // load the canvas
  public canvasLoader() {
    this.setCanvasSize();
    this.canvasContext = this.canvasNativeElement.getContext('2d');
  }

  // set the canvas size to be 70% of the window size
  public setCanvasSize() {
    this.canvasNativeElement = this.canvas.nativeElement;
    this.canvasNativeElement.width = window.innerWidth * 0.7;
    this.canvasNativeElement.height = window.innerHeight * 0.7;
  }
}
