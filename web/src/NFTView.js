function NFTView({ display, publicPath, nftID, type }) {
  return (
    <div>
      <div>NFT ID: {nftID}</div>
      <div>NFT Type: {type}</div>
      <img width={50} height={50} src={display?.thumbnail?.url}/>
    </div>
  );
}

export default NFTView;
