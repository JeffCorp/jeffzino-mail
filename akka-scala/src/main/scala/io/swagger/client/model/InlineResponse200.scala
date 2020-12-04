/**
 * Covid-19 Sniffer
 * This documentation was created to help developers use the Covid 19 Sniffer Resource.
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package io.swagger.client.model

import io.swagger.client.core.ApiModel
import org.joda.time.DateTime
import java.util.UUID

case class InlineResponse200 (
  message: Option[String] = None,
  /* access token which would be used in subsequent calls which require Authorization */
  token: Option[String] = None,
  user: Option[User] = None
) extends ApiModel


