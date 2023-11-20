import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { JsonRpcProvider } from 'ethers/providers'
import {
  nftaddress, nftmarketaddress, RPC_URL
} from '../config'

import NFT from 'build/contracts/NFT.json';
import Market from 'build/contracts/NFTMarket.json';

import Image from 'next/image';
import { tokenToString } from 'typescript'
export default function Home() {
  const provider = new JsonRpcProvider(RPC_URL);
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(()=>{
    loadNFTs();

  }, []);

  async function loadNFTs(){

   const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);

    //return an array of unsold market items
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(data.map(async i => {
       const tokenUri = await tokenContract.tokenURI(i.tokenId);
       const meta = await axios.get(tokenUri);
       console.log(typeof(i.price))
       console.log(i.price)
       let price = ethers.formatUnits(i.price.toString(), 'ether')

       let item = {
         price,
         tokenId: i.tokenId,
         seller: i.seller,
         owner: i.owner,
         image: meta.data.image,
         name: meta.data.name,
         description: meta.data.description,
       }
       return item;
    }));

    setNfts(items);
    setLoadingState('loaded')
  }

  async function buyNFT(nft){
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

    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer1);

    //set the price
    const price = ethers.parseUnits(nft.price.toString(), 'ether');
    console.log(typeof(price))

    console.log(nft.tokenId)
    

// Call the createMarketItem function

    //make the sale
    const transaction = await contract.createMarketSale(
      nftaddress, nft.tokenId, { value: price});
    await transaction.wait();

    loadNFTs()
  }

  if(loadingState === 'loaded' && !nfts.length) return (
    <div>
      <h1 className="px-20 py-10 text-3xl">No products available</h1>
    </div>
  )
  

  return (
   <div className="flex justify-center">
     <div className="px-4" style={{ maxWidth: '1600px'}}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {
          nfts.map((nft, i) =>(
            <div key={i} className="border shadow rounded-xl overflow-hidden">
             
              <Image
                  src={nft.image}
                  alt="Picture of the wine"
                  width={700}
                  height={800}
                  // blurDataURL="data:..." automatically provided
                  // placeholder="blur" // Optional blur-up while loading
                />
                        <div className="p-4 bg-blue-100">
                <p style={{ height: '50px'}} className="text-2xl font-semibold">
                  {nft.name}
                </p>
                <div style={{ height: '30px', overflow: 'hidden'}}>
                <p className="text-gray-500">Descripción: {nft.description}</p>
                </div>
              </div>
              <div className="p-4 bg-black">
                <p className="text-2xl mb-4 font-bold text-white">
                  {nft.price} ETH
                </p>
                <button className="w-full bg-blue-500 text-white font-bold py-2 px-12 rounded"
                onClick={() => buyNFT(nft)}>Buy</button>
            </div>
            </div>
          ))
        }
      </div>
     </div>
   </div>
  )
}