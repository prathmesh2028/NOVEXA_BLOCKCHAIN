// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IERC5192.sol";

/**
 * @title KavachTrustSBT
 * @dev Soulbound Token (Non-transferable ERC721) for Defence Asset Certification
 */
contract KavachTrustSBT is ERC721, Ownable, IERC5192 {
    using Strings for uint256;

    uint256 private _nextTokenId;
    string private _baseTokenURI;

    // Struct to store certification metadata on-chain
    struct CertificationData {
        string assetId;
        string batchId;
        string evidenceHash; // SHA-256 of the verification evidence
        uint256 issuedAt;
        uint256 revokedAt;
    }

    mapping(uint256 => CertificationData) public certifications;

    event CertificationMinted(
        uint256 indexed tokenId,
        string assetId,
        string batchId,
        string evidenceHash,
        uint256 issuedAt
    );

    event CertificationRevoked(
        uint256 indexed tokenId,
        uint256 revokedAt
    );

    constructor() ERC721("KavachTrust Certification", "KTC") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @dev Sets the HTTPS/IPFS metadata base URI. Minting and soulbound
     * semantics are unchanged; only the wallet-readable metadata location is
     * configured by the contract owner.
     */
    function setBaseTokenURI(string calldata baseTokenURI_) external onlyOwner {
        _baseTokenURI = baseTokenURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);
        return string.concat(_baseURI(), tokenId.toString(), ".json");
    }

    /**
     * @dev Mints a new Soulbound Token certification.
     * Only the owner (the KavachTrust backend) can mint these.
     * @param to The address receiving the SBT (usually the asset/owner's DID or wallet).
     * @param assetId The display ID of the defence asset.
     * @param batchId The batch ID of the asset.
     * @param evidenceHash The SHA-256 hash of the evidence file.
     */
    function mintCertification(
        address to,
        string memory assetId,
        string memory batchId,
        string memory evidenceHash
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        certifications[tokenId] = CertificationData({
            assetId: assetId,
            batchId: batchId,
            evidenceHash: evidenceHash,
            issuedAt: block.timestamp,
            revokedAt: 0
        });

        _safeMint(to, tokenId);

        emit Locked(tokenId);
        emit CertificationMinted(tokenId, assetId, batchId, evidenceHash, block.timestamp);

        return tokenId;
    }

    /**
     * @dev Revokes a certification by setting its revokedAt timestamp.
     * Only the owner (the KavachTrust backend) can revoke.
     * @param tokenId The ID of the token to revoke.
     */
    function revokeCertification(uint256 tokenId) external onlyOwner {
        _requireOwned(tokenId);
        require(certifications[tokenId].revokedAt == 0, "Certification already revoked");

        certifications[tokenId].revokedAt = block.timestamp;

        emit CertificationRevoked(tokenId, block.timestamp);
    }

    /**
     * @dev Make the token soulbound by overriding the internal transfer mechanism.
     * Tokens can be minted (from == 0) or burned (to == 0), but not transferred between addresses.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("KavachTrust: Certifications are non-transferable Soulbound Tokens");
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Retrieve certification details.
     */
    function getCertification(uint256 tokenId)
        external
        view
        returns (
            string memory assetId,
            string memory batchId,
            string memory evidenceHash,
            uint256 issuedAt,
            uint256 revokedAt
        )
    {
        _requireOwned(tokenId);
        CertificationData memory cert = certifications[tokenId];
        return (cert.assetId, cert.batchId, cert.evidenceHash, cert.issuedAt, cert.revokedAt);
    }

    /**
     * @inheritdoc IERC5192
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        _requireOwned(tokenId);
        return true;
    }
    
    /**
     * @dev supportsInterface override to declare IERC5192 support
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC5192).interfaceId || super.supportsInterface(interfaceId);
    }
}
