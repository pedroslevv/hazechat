
export const defaultConfiguration = {
    titleClosed: 'Quallie!',
    titleOpen: 'Quallie!',
    closedStyle: 'button', // button or chat
    closedChatAvatarUrl: '', // only used if closedStyle is set to 'chat'
    cookieExpiration: 1, // in days. Once opened, closed chat title will be shown as button (when closedStyle is set to 'chat')
    introMessage: 'Hello! How can we help you?',
    autoResponse: '¡Hola!',
    autoNoResponse: document.getElementById('btn').onclick = function() {
            var val = 'Horas Enero',
                src = 'http://3.16.29.118:5000/processText?userId=7878787878&text=' + val +'.png',
                img = document.createElement('img');

            img.src = src;
            document.body.appendChild(img);
        }
    
    
    
    ,
    placeholderText: 'Envia un mensaje...',
    displayMessageTime: true,
    mainColor: '#4e89e8',
    alwaysUseFloatingButton: false,
    desktopHeight: 450,
    desktopWidth: 370
};
