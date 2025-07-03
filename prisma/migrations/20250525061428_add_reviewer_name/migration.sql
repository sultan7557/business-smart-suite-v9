-- DropForeignKey
ALTER TABLE "CertificateReview" DROP CONSTRAINT "CertificateReview_certificateId_fkey";

-- AddForeignKey
ALTER TABLE "CertificateReview" ADD CONSTRAINT "CertificateReview_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
