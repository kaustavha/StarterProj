import React, { Component } from 'react'
import './AppContainer.css'

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));


const json = require('../../../contracts.json');
const rinkebyAdd = '0xc43027004853f8cfc982af3bc8eb2726aea4925a';

const gooseHunterContract = web3.eth.contract(json.GooseHunter).at(rinkebyAdd);

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const ipfsAPI = require('ipfs-api');





class AppContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gooseHunters: 0
    }
    this.ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: "https"});

    this.getInitialData = this.getInitialData.bind(this);

    //ipfs methods
    this.captureFile = this.captureFile.bind(this);
    this.captureFileInvariants = this.captureFileInvariants.bind(this);
    this.saveToIpfs = this.saveToIpfs.bind(this);
    this.arrayBufferToString = this.arrayBufferToString.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.handleAddHunter = this.handleAddHunter.bind(this);

    this.getInitialData();
    //this.handleSendMeta = this.handleSendMeta.bind(this)
  }
  componentDidMount() {
  //  this.getContractData();
  }
  getInitialData(){
    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      console.log("Successfully connected to MetaMask")
      web3.setProvider(window.web3.currentProvider);

      web3.eth.getAccounts(function(err, accs){
        if (err){
          console.log ('error fetching accounts', err);
        } else {
          this.setState({accounts: accs});


          gooseHunterContract.numGooseHunters((cerr, succ)=> {
            var num = parseInt(succ, 10);
            this.setState({gooseHunters: num});


          });
        }
      }.bind(this));
    } else {
      this.setState({metamaskError: "Please ensure you are using metamask"});
    }


  }




  captureFile (event) {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
      this.setState({sourceFileName: file.name});


    let reader = new window.FileReader()
    reader.onloadend = () => this.saveToIpfs(reader, "source")
    reader.readAsArrayBuffer(file)
  }
  captureFileInvariants (event) {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]

      this.setState({invariantsFileName: file.name});

    let reader = new window.FileReader()
    reader.onloadend = () => this.saveToIpfs(reader, "invariants")
    reader.readAsArrayBuffer(file)
  }


  saveToIpfs (reader, contract) {
    let ipfsId
    const buffer = Buffer.from(reader.result)
    this.ipfsApi.add(buffer)
    .then((response) => {
      console.log(response)
      ipfsId = response[0].hash
      console.log(ipfsId)
      if (contract == "source"){
        this.setState({sourceFileHash: ipfsId})
      } else {
        this.setState({invariantsFileHash: ipfsId})
      }

    }).catch((err) => {
      console.error(err)
    })
  }

  arrayBufferToString (arrayBuffer) {
    return String.fromCharCode.apply(null, new Uint16Array(arrayBuffer))
  }

  handleSubmit (event) {
    event.preventDefault()
  }


  handleAddHunter(evt){
    evt.preventDefault();

    var name = evt.target.hunter.value;

    console.log('hunter', hunter);

    gooseHunterContract.register({from: this.state.accounts[0]}, (cerr, succ)=> {
      console.log('succ');
    });


  }

  render() {

    return (
      <div style={{padding: "100px"}}>
        There are {this.state.gooseHunters} hunters


        <form className='AddProject' onSubmit={this.handleAddHunter} style={{backgroundColor: "rgba(10, 22, 40, 0.5)", padding: "15px", color: "white"}}>
        <label style={{fontSize: "12px"}} htmlFor='contract_title'>Add Hunter</label>
        <input id='hunter' className='SendAmount' type='text' ref={(i) => { if(i) { this.hunter = i}}} />

        <button type='submit' className='AddBtn' style={{backgroundColor: "rgba(255, 255, 255, 0.18)", border:"0px"}}>Add</button>

        </form>

      </div>

    )
  }
}

export default AppContainer
