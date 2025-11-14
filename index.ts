import * as aws from "@pulumi/aws";

// Create S3 bucket for hosting site
const bucket = new aws.s3.Bucket("websiteBucket", {
    website: {
        indexDocument: "index.html",
    },
});

// Upload a simple webpage
new aws.s3.BucketObject("index", {
    bucket: bucket.id,
    content: "<h1>Hello from Pulumi Static Website!</h1>",
    contentType: "text/html",
});

// Create CloudFront distribution
const cdn = new aws.cloudfront.Distribution("cdnDistribution", {
    enabled: true,
    origins: [
        {
            originId: "s3-origin",
            domainName: bucket.bucketRegionalDomainName,   // ✅ FIXED
            s3OriginConfig: {
                originAccessIdentity: "",                 // Required field
            },
        },
    ],

    defaultRootObject: "index.html",

    defaultCacheBehavior: {
        targetOriginId: "s3-origin",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
    },

    restrictions: {
        geoRestriction: {
            restrictionType: "none",                     // REQUIRED
        },
    },

    viewerCertificate: {
        cloudfrontDefaultCertificate: true,             // REQUIRED
    },
});

// Export URLs
export const bucketUrl = bucket.websiteEndpoint;
export const cloudfrontUrl = cdn.domainName;
