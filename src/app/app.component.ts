import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
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

  private startLocation: point = { x: 0, y: 0 };
  private initialStartLocation: point = {
    x: this.startLocation.x,
    y: this.startLocation.y,
  };
  private mouseDown: boolean = false;
  private initialMouseLocation: point = { x: 0, y: 0 };
  private zoomLevel: number = 1;

  //
  private previousDimensions: dimensions = { width: 0, height: 0 };
  private nextDimensions: dimensions = { width: 0, height: 0 };
  private imageDimensions: dimensions = { width: 0, height: 0 };

  private showStatistics: boolean = true;
  private showGuides: boolean = true;

  ngOnInit(): void {
    this.images.push(...this.generateRandomImages());
    this.selectedImage = this.images[0];
  }

  //increment or decrement zoom level
  public onZoom(direction: number) {
    //get the previous dimensions that the image was drawn at
    this.previousDimensions.width = this.imageDimensions.width * this.zoomLevel;
    this.previousDimensions.height =
      this.imageDimensions.height * this.zoomLevel;

    if (direction == 1) {
      //ZOOM IN
      this.zoomLevel += 0.1;
    }
    if (direction == 0) {
      //ZOOM OUT
      this.zoomLevel -= 0.1;
    }

    //get the next dimensions that the image WILL need to be drawn at
    this.nextDimensions.width = this.imageDimensions.width * this.zoomLevel;
    this.nextDimensions.height = this.imageDimensions.height * this.zoomLevel;

    this.reloadCanvas(null, true);
  }

  //reset the zoom level
  public onReset() {
    this.zoomLevel = 1;
    this.reloadCanvas();
  }

  public onResetImagePosition() {
    this.startLocation.x = 0;
    this.startLocation.y = 0;
    this.reloadCanvas();
  }

  ngAfterViewInit(): void {
    console.log(this.canvas.nativeElement);
    this.canvasLoader();
    this.reloadCanvas();

    // event listner setup for mouse movement
    this.canvasNativeElement.addEventListener('mousemove', (event) => {
      this.reloadCanvas(event);
      if (this.mouseDown) {
        //update the start location of the image based on the initial start location of the image, the initial mouse
        //location of the image, and the current mouse location, flip it with a -1 to drag it in the same direction as mouse movement
        this.startLocation.x =
          this.initialStartLocation.x +
          (this.initialMouseLocation.x - event.offsetX) * -1;
        this.startLocation.y =
          this.initialStartLocation.y +
          (this.initialMouseLocation.y - event.offsetY) * -1;
      }
    });

    this.canvasNativeElement.addEventListener('mousedown', (event) => {
      this.mouseDown = true;
      //capture the inital mouse positions and initial start location for the image on the canvas
      //need to know this infomation to do offset math when re-drawing.
      this.initialMouseLocation.x = event.offsetX;
      this.initialMouseLocation.y = event.offsetY;
      this.initialStartLocation.x = this.startLocation.x;
      this.initialStartLocation.y = this.startLocation.y;
      console.log(this.mouseDown);
    });

    this.canvasNativeElement.addEventListener('mouseup', (event) => {
      this.mouseDown = false;
      console.log(this.mouseDown);
    });

    this.canvasNativeElement.addEventListener('wheel', (event) => {
      if (event.deltaY > 0) {
        //mouse scroll down

        this.onZoom(1);
      }

      if (event.deltaY < 0) {
        //mouse scroll up

        this.onZoom(0);
      }
    });
  }

  // reload the canvas
  public reloadCanvas(mouseEvent: MouseEvent = null, zoomed: boolean = false) {
    let image: HTMLImageElement = new Image();
    image.src = this.selectedImage;
    this.imageDimensions.width = image.width;
    this.imageDimensions.height = image.height;
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

      //if the user zoomed in (alogirthm is using image on canvas as context)
      //TODO: create logic maybe for if we want to zoom in at the center of the viewport instead of center of image
      //TODO: create logic maybe for if we want to zoom in at the mouse position instead of the viewport or image
      if (zoomed) {
        console.log(this.nextDimensions);
        console.log(this.previousDimensions);
        this.startLocation.x -=
          (this.nextDimensions.width - this.previousDimensions.width) / 2;
        this.startLocation.y -=
          (this.nextDimensions.height - this.previousDimensions.height) / 2;
        console.log(this.startLocation);
      }

      //draw the image
      console.log(image.src, image.width, image.height);
      this.canvasContext.drawImage(
        image,
        this.startLocation.x,
        this.startLocation.y,
        image.width * this.zoomLevel,
        image.height * this.zoomLevel
      );

      //draw helpful guiding aids
      if(this.showGuides) this.drawGuidanceHelpers(image, mouseEvent);

      //draw helpful statistics information
      if(this.showStatistics) this.drawStatistics(image, mouseEvent);
    };
  }

  /**
   * draw guidance helpers for the canvas, makes things easier to percieve
   * @param image 
   * @param mouseEvent 
   */
  private drawGuidanceHelpers(image: HTMLImageElement, mouseEvent: MouseEvent) {
    //draw a box around the image
    this.canvasContext.strokeStyle = 'cyan';
    this.canvasContext.strokeRect(
      this.startLocation.x,
      this.startLocation.y,
      image.width * this.zoomLevel,
      image.height * this.zoomLevel
    );

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
  }

  /**
   * draw helpful statistical information in the top right corner of the canvas
   * @param image 
   * @param mouseEvent 
   */
  private drawStatistics(image: HTMLImageElement, mouseEvent: MouseEvent) {
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(3, 2, 300, 200);

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

    this.canvasContext.fillText(`Image Coordinates:`, 10, 91);
    if (mouseEvent !== null) {
      this.canvasContext.fillText(
        `Initial Start Point: X: ${this.initialStartLocation.x} Y: ${this.initialStartLocation.y}`,
        10,
        101
      );
      this.canvasContext.fillText(
        `Moved To: X: ${this.startLocation.x} Y: ${this.startLocation.y}`,
        10,
        111
      );
    }
    this.canvasContext.fillText(`Zoom Levels:`, 10, 121);
    this.canvasContext.fillText(`Level: ${this.zoomLevel}`, 10, 131);
    this.canvasContext.fillText(`image size with zoom:`, 10, 141);
    this.canvasContext.fillText(
      `L: ${image.width * this.zoomLevel} W:${image.height * this.zoomLevel}`,
      10,
      151
    );
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

  /**
   * toggle the guides on and off
   */
  public onToggleGuides(): void{
    this.showGuides = !this.showGuides;
    this.reloadCanvas();
  }

  /**
   * toggle the statistics on and off
   * @param $event 
   */
  public onToggleStats($event): void {
    console.log($event);
    this.showStatistics = !this.showStatistics;
    this.reloadCanvas();
  };
}

interface point {
  x: number;
  y: number;
}

interface dimensions {
  width: number;
  height: number;
}