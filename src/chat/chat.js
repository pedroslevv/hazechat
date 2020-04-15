import * as store from 'store'
import io from 'socket.io-client'
import { h, Component } from 'preact';
import MessageArea from './message-area';


export default class Chat extends Component {

    autoResponseState = 'pristine'; // pristine, set or canceled
    autoResponseTimer = 0;

    constructor(props) {
        super(props);
        if (store.enabled) {
            this.messagesKey = 'messages' + '.' + props.chatId + '.' + props.host;
            this.state.messages = store.get(this.messagesKey) || store.set(this.messagesKey, []);
        } else {
            this.state.messages = [];
        }
    }

    componentDidMount() {
        this.socket = io.connect();
        this.socket.on('connect', () => {
            this.socket.emit('register', {chatId: this.props.chatId, userId: this.props.userId });
        });
        this.socket.on(this.props.chatId, this.incomingMessage);
        this.socket.on(this.props.chatId+'-'+this.props.userId, this.incomingMessage);

        if (!this.state.messages.length) {
            this.writeToMessages({text: this.props.conf.introMessage, from: 'admin'});
        }
    }

    render({},state) {
        return (
            <div>
                <MessageArea messages={state.messages} conf={this.props.conf}/>

                <input class="textarea" type="text" placeholder={this.props.conf.placeholderText}
                       ref={(input) => { this.input = input }}
                       onKeyPress={this.handleKeyPress}/>

                <a class="banner" href="https://www.hazear.com" target="_blank">
                    Powered by <b> Haze Inc </b> &nbsp;
                </a>
            </div>
        );
    }

    
    
    //CHECK SOBRE CUALQUIER KEYPRESS
    handleKeyPress = (e) => {
        //CHECK FOR ENTER KEY
        if (e.keyCode == 13 && this.input.value) {
            let text = this.input.value;
            this.socket.send({text, from: 'visitor', visitorName: this.props.conf.visitorName});
            this.input.value = '';
            
            //CHECK SI ES LA PRIMER INTERACCION DE USUARIO CON EL WIDGET. EL WIDGET UTILIZA COOKIES PARA SABER ESTO TAMBIEN
            if (this.autoResponseState === 'pristine') {
        
                //"HOLA!" MESSAGE
                setTimeout(() => {
                    this.writeToMessages({
                        text: this.props.conf.autoResponse,
                        from: 'admin'});
                }, 500);
                
                //"¿EN QUE PUEDO AYUDARTE?" MESSAGE
                setTimeout(() => {
                    this.writeToMessages({
                    text: this.props.conf.autoNoResponse,        
                        from: 'admin'});
                }, 500);
                this.autoResponseState = 'set';
            }
            
                //RESPUESTA QUALLIE
            
                fetch("https://bot.qualesgroup.com:5000/?userId=28324082&text=" + text , { mode: 'no-cors'})
                .then (function(response){
                    this.writeToMessages({
                    text: response,        
                    from: 'admin'}
                       , 500);
                }
                );       
        }
    };




    incomingMessage = (msg) => {
        this.writeToMessages(msg); //este es el mensaje que el usuario escribe
        
        //en esta parte depende de si el bot responde
        if (msg.from === 'admin') {
            document.getElementById('messageSound').play();

        }
    };

    writeToMessages = (msg) => {
        msg.time = new Date();
        this.setState({
            message: this.state.messages.push(msg)
        });

        if (store.enabled) {
            try {
                store.transact(this.messagesKey, function (messages) {
                    messages.push(msg);
                });
            } catch (e) {
                console.log('failed to add new message to local storage', e);
                store.set(this.messagesKey, [])
            }
        }
    }

}
 
