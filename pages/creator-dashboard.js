import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Image from "next/image";

import {
  nftmarketaddress, nftaddress
} from '../config'

import Market from 'build/contracts/NFTMarket.json'
import NFT from 'build/contracts/NFT.json';

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [sold, setSold] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {

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

      
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer1)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider1)
    const data = await marketContract.fetchItemsCreated()
    
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId,
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        image: meta.data.image,
      }
      return item
    }))
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setLoadingState('loaded')
  }
  if (loadingState === 'loaded' && !nfts.length){
    return (<h1 className="py-10 px-20 text-3xl">No properties created</h1>)
  } 
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Properites created</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
               

                        <Image
                            src={nft.image}
                            alt="Picture of the property"
                            className="rounded"
                            width={700}
                            height={800} 
                            // blurDataURL="data:..." automatically provided
                            // placeholder="blur" // Optional blur-up while loading
                          />

                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
        <div className="px-4">
        {
          Boolean(sold.length) && (
            <div>
              <h2 className="text-2xl py-2">Porperties sold</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                  sold.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                      <img src={nft.image} className="rounded" />
                      <div className="p-4 bg-black">
                        <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )
        }
        </div>
    </div>
  )
}



