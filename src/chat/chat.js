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

    
    
    //aca chekea si se toco el enter
    handleKeyPress = (e) => {
        if (e.keyCode == 13 && this.input.value) {
            let text = this.input.value;
            this.socket.send({text, from: 'visitor', visitorName: this.props.conf.visitorName});
            this.input.value = '';

            if (this.autoResponseState === 'pristine') {

                
                //hola message
                setTimeout(() => {
                    this.writeToMessages({
                        text: this.props.conf.autoResponse,
                        from: 'admin'});
                }, 500);
                
                //En que puedo ayudarte message
                setTimeout(() => {
                    this.writeToMessages({
                    text: this.props.conf.autoNoResponse,        
                        from: 'admin'});
                }, 500);
                
                this.autoResponseState = 'set';
            
            }
            $.ajax({
                        url: 'http://3.16.29.118:5000/processText',
                        method: 'GET',
                        data: {'userId':7878787878,
                               'text': text}
                    }).done(function (response) {
                       console.log(response);
                        
                        
                    }).fail(function () {
                        console.log('error AJAX');
                       
                    })
            //aca tiene que venir la funcion AJAX 
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
