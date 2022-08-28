const canvas = document.getElementById("editor");
const editor = new Editor(canvas);
const toolbox = new ToolBox(editor);
const inspector = new Inspector(editor);

Array.from(document.querySelectorAll('.top-bar .nav-item')).forEach(navItem=>{
    Array.from(navItem.querySelectorAll('.dropdown-item')).forEach(dropdownItem=>{
        dropdownItem.onclick = () => {
            editor[dropdownItem.getAttribute('data-action')]();
            navItem.classList.add('disabled');
            setTimeout(() => {
                navItem.classList.remove('disabled');
            }, 350);
        };
    });
});