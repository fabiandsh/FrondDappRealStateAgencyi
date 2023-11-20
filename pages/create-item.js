import {useState } from 'react'
import { ethers, providers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
const client = ipfsHttpClient('http://127.0.0.1:5001');
import {
    nftaddress,nftmarketaddress
} from '../config';
import NFT from 'build/contracts/NFT.json';
import Market from 'build/contracts/NFTMarket.json';
import Image from 'next/image';

//this function allow you to create an item (property)
export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({price: '', name: '', description:'', address:''})
    const router = useRouter();

    async function onChange(e) {
        const file = e.target.files[0]
        try{ //try uploading the file
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            //file saved in the url path below
           
            const url = `http://127.0.0.1:8080/ipfs/${added.path}`
            setFileUrl(url)
        }catch(e){
            console.log('Error uploading the file: ', e)
        }
    }

    //1. create item (image) and upload to ipfs
    async function createItem(){
        
        const {name, description, price, address} = formInput; //get the value from the form input
        
        //form validation 
        //check that there every field is fill
        if(!name || !price || !fileUrl) {
            return
        }

        const data = JSON.stringify({
            name, description, address,  image: fileUrl
        });

        try{
            const added = await client.add(data)
            const url = `http://127.0.0.1:8080/ipfs/${added.path}`
            console.log(url)
            createSale(url)
        }catch(error){
            console.log(`Error uploading file: `, error)
        }
    }

    //list item for sale with its price
    async function createSale(url){


        let signer1 = null;

        let provider1;

        if (window.ethereum == null) {

                console.log("MetaMask not installed; using read-only defaults")
                provider1 = ethers.getDefaultProvider()

        } else {
            provider1 = new ethers.BrowserProvider(window.ethereum)
            signer1 = await provider1.getSigner();
            console.log(signer1)
        }

      
         let contract = new ethers.Contract(nftaddress, NFT.abi, signer1);

        let transaction = await contract.createToken(url)
          
        let tx = await transaction.wait()
          console.log('Esperando')
           
          console.log('Transaction: ',tx)
          //console.log('Transaction events: ',tx.events[0])

          //let event = tx.events[0]
          //let value = event.args[2]

          let tokenId = 1 //we need to convert it a number
  
          //get a reference to the price entered in the form 
          const price = ethers.parseUnits(formInput.price, 'ether')
          const address = formInput.address
  
           contract = new ethers.Contract(nftmarketaddress, Market.abi, signer1);
  
          //get the listing price
          let listingPrice = await contract.getListingPrice()
          listingPrice = listingPrice.toString()
  
          transaction = await contract.createMarketItem(
              nftaddress, tokenId, address,  price, {value: listingPrice }
          )
          await transaction.wait()
          router.push('/')
       
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input 
                    placeholder="Product name"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({...formInput, name: e.target.value})}
                    />
                <input
                     placeholder="Address"
                     className="mt-10 border rounded p-4"
                     onChange={e => updateFormInput({...formInput, address: e.target.value})}
                />
                <input
                    placeholder="Description"
                    className="mt-4 border rounded p-6"
                    onChange={e => updateFormInput({...formInput, description: e.target.value})}
                    />
                <input 
                    placeholder="Price in Eth"
                    className="mt-4 border rounded p-4"
                    type="number"
                    onChange={e => updateFormInput({...formInput, price: e.target.value})}
                    />
                    <input
                        type="file"
                        name="Asset"
                        className="my-4"
                        onChange={onChange}
                    />
                    {
                        fileUrl && (
                           
                            <Image
                            src={fileUrl}
                            alt="Picture of the property"
                            className="rounded mt-4"
                            width={700}
                            height={800} 
                            // blurDataURL="data:..." automatically provided
                            // placeholder="blur" // Optional blur-up while loading
                          />
                        )
                    }
                    <button onClick={createItem}
                     className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
                     >Publish my property</button>
            </div>
        </div>
    )
}