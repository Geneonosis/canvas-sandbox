import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

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

    // event listner setup for mouse movement
    this.canvasNativeElement.addEventListener('mousemove', (event) => {
      this.reloadCanvas(event);
    });
  }

  // reload the canvas
  public reloadCanvas(mouseEvent: MouseEvent = null) {
    let image: HTMLImageElement = new Image();
    image.src = this.selectedImage;
    //what to do on image load
    image.onload = () => {
      //reset the canvas area to black
      this.canvasContext.fillStyle = 'black';
      this.canvasContext.fillRect(
        0,
        0,
        this.canvasNativeElement.width,
        this.canvasNativeElement.height
      );
      //draw the image
      console.log(image.src, image.width, image.height);
      this.canvasContext.drawImage(image, 0, 0, image.width, image.height);

      //draw a box around the image
      this.canvasContext.strokeStyle = 'cyan';
      this.canvasContext.strokeRect(0, 0, image.width, image.height);

      //draw the mouse
      this.canvasContext.fillStyle = 'black';
      this.canvasContext.fillRect(
        mouseEvent?.offsetX,
        mouseEvent?.offsetY,
        90,
        -10
      );
      this.canvasContext.fillStyle = 'white';
      this.canvasContext.fillText(
        `X: ${mouseEvent?.offsetX} Y: ${mouseEvent?.offsetY}`,
        mouseEvent?.offsetX + 1,
        mouseEvent?.offsetY - 1
      );

      //draw the red border
      this.canvasContext.strokeStyle = 'red';
      this.canvasContext.strokeRect(
        0,
        0,
        this.canvasNativeElement.width,
        this.canvasNativeElement.height
      );

      //draw the red center point
      this.canvasContext.fillStyle = 'red';
      this.canvasContext.fillRect(
        this.canvasNativeElement.width / 2 - 2,
        this.canvasNativeElement.height / 2 - 2,
        4,
        4
      );

      //draw the black background for the center point text
      this.canvasContext.fillStyle = 'black';
      this.canvasContext.fillRect(
        this.canvasNativeElement.width / 2 - 2,
        this.canvasNativeElement.height / 2 - 20,
        100,
        10
      );

      //draw the center point text
      this.canvasContext.fillStyle = 'red';
      this.canvasContext.fillText(
        `center point`,
        this.canvasNativeElement.width / 2,
        this.canvasNativeElement.height / 2 - 10
      );

      //draw the black background for the image stats text
      this.canvasContext.fillStyle = 'black';
      this.canvasContext.fillRect(3, 2, 180, 100);

      //draw the image stats text
      this.canvasContext.fillStyle = 'white';
      this.canvasContext.fillText(
        `canvas: width x height: ${this.canvasNativeElement.width} x ${this.canvasNativeElement.height}`,
        10,
        11
      );
      this.canvasContext.fillText(
        `image: width x height: ${image.width} x ${image.height}`,
        10,
        21
      );
      this.canvasContext.fillText(`Mouse Coordinates:`, 10, 31);

      //draw the mouse coordinates
      if (mouseEvent !== null) {
        this.canvasContext.fillText(
          `Offset: X: ${mouseEvent?.offsetX} Y: ${mouseEvent?.offsetY}`,
          10,
          41
        );
        this.canvasContext.fillText(
          `Normal: X: ${mouseEvent?.x} Y: ${mouseEvent?.y}`,
          10,
          51
        );
        this.canvasContext.fillText(
          `Page: X: ${mouseEvent?.pageX} Y: ${mouseEvent?.pageY}`,
          10,
          61
        );
        this.canvasContext.fillText(
          `Screen: X: ${mouseEvent?.screenX} Y: ${mouseEvent?.screenY}`,
          10,
          71
        );
        this.canvasContext.fillText(
          `Client: \t X: ${mouseEvent?.clientX} Y: ${mouseEvent?.clientY}`,
          10,
          81
        );
      }
    };
  }

  // click on an image
  public onClickImage(image: string) {
    console.log(image);
    this.selectedImage = image;
    this.reloadCanvas();
  }

  // generate random images
  public generateRandomImages(): string[] {
    const randomImages = [];
    for (let i = 0; i < 10; i++) {
      randomImages.push(
        `https://picsum.photos/id/${Math.floor(
          Math.random() * 1000
        )}/${this.randomBetweenMinMax(960, 1920)}/${this.randomBetweenMinMax(
          540,
          1080
        )}`
      );
    }
    return randomImages;
  }

  public randomBetweenMinMax(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  // set the canvas size to be the same as the offsetWidth and offsetHeight of the canvas
  public setCanvasSize() {
    this.canvasNativeElement = this.canvas.nativeElement;

    //! this is super wrong, but I don't know why
    // this.canvasNativeElement.width = window.innerWidth * 0.7;
    // this.canvasNativeElement.height = window.innerHeight * 0.7;

    // this is the correct way, found here:
    // https://tinyurl.com/bdett9sy
    this.canvasNativeElement.width = this.canvas.nativeElement.offsetWidth;
    this.canvasNativeElement.height = this.canvas.nativeElement.offsetHeight;

    console.log(
      this.canvasNativeElement.width,
      this.canvasNativeElement.height
    );
  }
}
