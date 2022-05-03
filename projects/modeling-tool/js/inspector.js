class Inspector{
    static initInspector(sceneObjects){
        sceneObjects.forEach((object)=>{
            var icon = "";

            if(object.type === "cube"){
                icon = "img/icons/mesh_cube.svg";
            } else if(object.type === "light"){
                icon = "img/icons/light.svg";
            }

            if(object.status === 'active'){
                $("#x-input").val(object.element.position.x);
                $("#y-input").val(object.element.position.y);
                $("#z-input").val(object.element.position.z);
                $("#x-scale-input").val(object.element.scaling.x);
                $("#y-scale-input").val(object.element.scaling.y);
                $("#z-scale-input").val(object.element.scaling.z);
            }

            $(".scene-inspector").append(`<div class="inspector-item ${object.status}" id="${object.id}"><div class="icon"><img src="${icon}"></div><div class="name">${object.name}</div></div>`);
        });

        $(".tab-wrapper .tab-item").each(function(){
            $(this).click(function(){
                $(".tab-wrapper .tab-item").removeClass("active");
                $(this).addClass("active");
                $(".tab-content .window").removeClass('active');
                $(".tab-content ."+$(this).attr('href')+"-window").addClass('active');
            });
        });

        $(".inspector-item").each(function(){
            this.onclick = function(){
                $(".inspector-item").removeClass('active');
                $(".inspector-item").addClass('inactive');
                $(this).removeClass("inactive");
                $(this).addClass("active");

                var activeEl;

                sceneObjects.forEach((object)=>{
                    if(object.id === $(this).attr("id") && object.type !== "light"){
                        object.status = 'active';
                        activeEl = object.element;
                    } else {
                        object.status = 'inactive';
                    }
                });

                if(!activeEl) return;

                $("#x-input").val(activeEl.position.x);
                $("#y-input").val(activeEl.position.y);
                $("#z-input").val(activeEl.position.z);
                $("#x-scale-input").val(activeEl.scaling.x);
                $("#y-scale-input").val(activeEl.scaling.y);
                $("#z-scale-input").val(activeEl.scaling.z);
            };
        });
    }
}