/*
 * Copyright (C) 2017 VSCT
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package fr.vsct.tock.translator

/**
 * A raw string is a string that should not be translated.
 */
data class RawString(private val wrapped: CharSequence)
    : CharSequence by wrapped {

    override fun toString(): String {
        return wrapped.toString()
    }

    override fun subSequence(startIndex: Int, endIndex: Int): CharSequence {
        return RawString(wrapped.subSequence(startIndex, endIndex))
    }
}