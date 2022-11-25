/************************************/
/*      (C) Nico Thuniot 2022       */
/************************************/

// creates ripple at a given position in a button
function createRipple(event) {
    const button = event.currentTarget;
    
    // create circle
    const circle = document.createElement("span");
    // set circle color (either custom attribute or default)
    circle.style.backgroundColor = button.getAttribute('ripple-color') || "rgba(255,255,255,.7)";
    circle.style.animationDuration = button.getAttribute('ripple-duration') || "1s";
    const rippleSize = button.getAttribute('ripple-size') || 1;
    // calculate ripple diameter based on button width
    const diameter = Math.max(button.clientWidth, button.clientHeight) * rippleSize;
    // calculate ripple radius
    const radius = diameter / 2;

    // get button position
    const offset = button.getBoundingClientRect();
    
    // position ripple based on clicked position on button
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - offset.left - radius}px`;
    circle.style.top = `${event.clientY - offset.top - radius}px`;
    circle.classList.add("ripple");
  
    const ripple = button.getElementsByClassName("ripple")[0];
    
    // if there is already a previous ripple, remove it
    if (ripple && ripple.style.opacity === "0") {
      ripple.remove();
    }
    
    // add new ripple to button
    button.appendChild(circle);
}