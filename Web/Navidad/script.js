// Crear contenedor de nieve si no existe
let snowContainer = document.querySelector('.snow-container');

if (!snowContainer) {
    snowContainer = document.createElement('div');
    snowContainer.classList.add('snow-container');
    document.body.appendChild(snowContainer);
}

function createSnowflakes(num) {
    for (let i = 0; i < num; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');

        const size = Math.random() * 20 + 10;
        snowflake.style.fontSize = `${size}px`;

        const leftPosition = Math.random() * 100;
        snowflake.style.left = `${leftPosition}vw`;

        const speed = Math.random() * 10 + 5;
        snowflake.style.animationDuration = `${speed}s`;

        const horizontalMovement = (Math.random() - 0.5) * 50;
        snowflake.style.transform = `translateX(${horizontalMovement}px)`;

        snowflake.innerHTML = '&#10052;';
        snowflake.style.color = `hsl(${Math.random() * 360}, 100%, 100%)`;

        snowContainer.appendChild(snowflake);

        snowflake.addEventListener('animationend', () => snowflake.remove());
    }
}

createSnowflakes(20);

setInterval(() => {
    createSnowflakes(1);
}, 2000);
